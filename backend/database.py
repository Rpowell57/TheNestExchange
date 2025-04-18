import pyodbc
import os
import urllib.parse
import redis
import json
import traceback
from sqlalchemy import text 
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import Base
from azure.storage.blob import BlobServiceClient


load_dotenv()

#Redis setup
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6380)
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
REDIS_DB = os.getenv("REDIS_DB", 0)
redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

# Load environment variables
AZURE_STORAGE_SAS_URL = os.getenv("AZURE_STORAGE_SAS_URL") 
AZURE_CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME")  

# Initialize BlobServiceClient using the SAS URL
account_url = f"https://{os.getenv('AZURE_STORAGE_ACCOUNT_NAME')}.blob.core.windows.net"
blob_service_client = BlobServiceClient(account_url=account_url, credential=AZURE_STORAGE_SAS_URL)


def upload_image_to_blob(image_file, filename):
    """Uploads an image to Azure Blob Storage using SAS URL and returns the URL."""
    try:
        # Get a blob client for the specified file
        blob_client = blob_service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=filename)

        # Upload the file
        blob_client.upload_blob(image_file, overwrite=True)

        # Return the URL of the uploaded file
        return f"https://nextexchangeblob.blob.core.windows.net/{AZURE_CONTAINER_NAME}/{filename}"
    
    except Exception as e:
        print(f"Error uploading image: {e}")
        return None

# Database credentials from environment variables
DB_SERVER = os.getenv("DB_SERVER", "nestexchange.database.windows.net")
DB_NAME = os.getenv("DB_NAME", "nestExchange")
DB_USERNAME = os.getenv("DB_USERNAME", "nestadmin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Nestexchange25")

# Encode password for safe URL usage
encoded_password = urllib.parse.quote_plus(DB_PASSWORD)

# SQLAlchemy Database URL
DATABASE_URL = f"mssql+pyodbc://{DB_USERNAME}:{encoded_password}@{DB_SERVER}/{DB_NAME}?driver=ODBC+Driver+18+for+SQL+Server"

# Print database connection string for debugging (excluding password)
print("Connecting to:", DATABASE_URL.replace(encoded_password, "*****"))

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("Database connection successful!")
except Exception as e:
    print(f"Database connection failed: {e}")


# FastAPI Dependency for Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to create a new database connection
def create_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_NAME};"
        f"UID={DB_USERNAME};"
        f"PWD={DB_PASSWORD};"
        "Encrypt=yes;"
        "TrustServerCertificate=no;"
        "Connection Timeout=30;"
    )


def read():
    cache_key = "users:all"
    cached_data = redis_client.get(cache_key)
    
    if cached_data:
        print("Cache hit! Fetching users from Redis.")
        return json.loads(cached_data)
    
    try:
        with create_connection() as conn:
            print("Reading data from Users table...")
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Users;")
            rows = cursor.fetchall()
            user_list = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
            
            redis_client.setex(cache_key, 1800, json.dumps(user_list))  # Cache for 30 min
            return user_list
    except Exception as e:
        print(f"Error reading from Users table: {e}")
        return []


#user Management for future implementations
def verifyLogin(userID, userPassword):
    cache_key = f"user:{userID}:auth"
    cached_result = redis_client.get(cache_key)
    if cached_result:
        print("Cache hit for user login verification!")
        return cached_result == "True"
    
    try:
        db = next(get_db())  # Use SQLAlchemy session
        result = db.execute(
            "EXEC dbo.verifyLogin ?, ?", (userID, userPassword)
        ).fetchone()
        
        if result:
            redis_client.setex(cache_key, 3600, "True")
            return True
        else:
            redis_client.setex(cache_key, 3600, "False")
            return False
    except Exception as e:
        print(f"Error verifying login: {e}")
        return False


def newUser(userID, userEmail, userPassword, userIsAdmin, userFirstName, userLastName, userIsStudent):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "{CALL newUser(?,?,?,?,?,?,?)}",
                (userID, userEmail, userPassword, userIsAdmin, userFirstName, userLastName, userIsStudent)
            )
            conn.commit()
            print("User created successfully!")
    except Exception as e:
        print(f"Error inserting new user: {e}")

def newListing(aListUser, alistname, listCategory, alistdescription, aListClaimDescription, aIsClaimed, aListPicture, alistPicture2):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "EXEC newListing ?, ?, ?, ?, ?, ?, ?, ?",
                (aListUser, alistname, listCategory, alistdescription, aListClaimDescription, aIsClaimed, aListPicture, alistPicture2)
            )
            conn.commit()
            print("New listing inserted into the database successfully.")
    except Exception as e:
        print(f"Error inserting new listing: {e}")


def approve_listing(listID):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC approveListing ?", listID)
            conn.commit()

          
            redis_client.delete("listings:all")

            print("Listing has been successfully approved!")
    except Exception as e:
        print(f"Error approving listing: {e}")



def reject_listing(listID):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC dontApproveListing ?", listID)
            conn.commit()
            redis_client.delete(f"listing:{listID}:approved")  # Remove from cache
            print("Listing has been successfully rejected!")
    except Exception as e:
        print(f"Error rejecting listing: {e}")



def delete_approved_listing(listID):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC delteApprovedListing ?", listID)
            conn.commit()
            print("Listing has been successfully deleted!")
    except Exception as e:
        print(f"Error deleting listing: {e}")

#Claiming and Selling management
def claim_item(claimListID, claimedUserID, claimedReview, claimedRating):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "EXEC claimItem ?, ?, ?, ?",
                (claimListID, claimedUserID, claimedReview, claimedRating)
            )
            conn.commit()
            print("Item claimed successfully!")
    except Exception as e:
        print(f"Error claiming item: {e}")


def sell_item(soldListID, soldReview, soldRating):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC soldItem ?, ?, ?", (soldListID, soldReview, soldRating))
            conn.commit()
            print("Item marked as sold successfully!")
    except Exception as e:
        print(f"Error selling item: {e}")

def get_listings_for_user(listUserID):
    try:
        # Create a connection to the database
        with create_connection() as conn:
            cursor = conn.cursor()
            # Execute the stored procedure
            cursor.execute("EXEC allListingsForSpecificUser ?", (listUserID,))
            result = cursor.fetchall()

            listings = [
                {
                    "alistID": row[0],
                    "aListUserID": row[1],
                    "aListDate": row[2].strftime("%Y-%m-%d") if isinstance(row[2], date) else row[2],
                    "aListCategory": row[3],
                    "aListClaimDescription": row[4],
                    "aIsClaimed": row[5],
                    "aListPicture": row[6],
                    "aListPicture2": row[7],
                    "aListdescription": row[8],
                    "aListName": row[9]
                }
                for row in result
            ]

            return listings
    except Exception as e:
        print(f"Error fetching listings for user {listUserID}: {e}")
        return None

def all_sold_for_specific_user(db: Session, list_user_id: str):
    try:
        query = text("""
            EXEC allSoldForSpecificUser :listUserID
        """)
        result = db.execute(query, {"listUserID": list_user_id}).fetchall()
        
        listings = [
            {
                "listID": row.listID,
                "listUserID": row.listUserID,
                "listDate": row.listDate.strftime("%Y-%m-%d") if isinstance(row.listDate, date) else row.listDate,
                "listCategory": row.listCategory,
                "listDescription": row.listDescription,
                "listClaimDescription": row.listClaimDescription,
                "isClaimed": row.isClaimed,
                "listPicture": row.listPicture if row.listPicture else "",
                "listPicture2": row.listPicture2 if row.listPicture2 else "",
                "ListName": row.ListName
            }
            for row in result
        ]
        return listings
    except Exception as e:
        print(f"Error fetching sold listings for user {list_user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def all_claimed_for_specific_user(db: Session, list_user_id: str):
    try:
        query = text("""
            EXEC allClaimedForSpecificUser :listUserID
        """)
        result = db.execute(query, {"listUserID": list_user_id}).fetchall()
        
        listings = [
            {
                "listID": row.listID,
                "listUserID": row.listUserID,
                "listDate": row.listDate.strftime("%Y-%m-%d") if isinstance(row.listDate, date) else row.listDate,
                "listCategory": row.listCategory,
                "listDescription": row.listDescription,
                "listClaimDescription": row.listClaimDescription,
                "isClaimed": row.isClaimed,
                "listPicture": row.listPicture if row.listPicture else "",
                "listPicture2": row.listPicture2 if row.listPicture2 else "",
                "ListName": row.ListName
            }
            for row in result
        ]
        return listings
    except Exception as e:
        print(f"Error fetching claimed listings for user {list_user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def get_all_listings(db: Session):
    try:
        # Explicitly reference the dbo schema and the allListings view
        query = text("SELECT * FROM dbo.allListings")
        result = db.execute(query).fetchall()

        listings = [
            {
                "listID": row.listID,
                "listUserID": row.listUserID,
                "listDate": row.listDate.strftime("%Y-%m-%d") if row.listDate and isinstance(row.listDate, date) else row.listDate,
                "listCategory": row.listCategory,
                "listDescription": row.listDescription,
                "listClaimDescription": row.listClaimDescription,
                "isClaimed": row.isClaimed,
                "listPicture": row.listPicture if row.listPicture else "",
                "listPicture2": row.listPicture2 if row.listPicture2 else "",
                "ListName": row.ListName,
            }
            for row in result
        ]
        return listings
    except Exception as e:
        print(f"Error fetching all listings: {e}")
        raise HTTPException(status_code=500, detail="Error fetching listings from database")


def get_unclaimed_listings():
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM Listing WHERE isClaimed = 0"
            print(f"Executing query: {query}")  # Log the query
            cursor.execute(query)
            columns = [column[0] for column in cursor.description]
            listings = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return listings
    except Exception as e:
        import traceback
        print("Error fetching unclaimed listings:")
        traceback.print_exc()
        return []

def get_all_users():
    try:
        with create_connection() as conn:
            print("Fetching users from database...")
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM dbo.Users")
            columns = [column[0] for column in cursor.description]
            users = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return users
    except Exception as e:
        print("Exception in get_all_users:")
        traceback.print_exc()
        raise e  

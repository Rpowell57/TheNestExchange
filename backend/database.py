import pyodbc
import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import Base
from azure.storage.blob import BlobServiceClient

#Load environment variables from .env
load_dotenv()

# Load environment variables
AZURE_STORAGE_SAS_URL = os.getenv("AZURE_STORAGE_SAS_URL")  # Full URL with SAS token
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")  # Container name

# Initialize BlobServiceClient using the SAS URL
blob_service_client = BlobServiceClient(account_url=AZURE_STORAGE_SAS_URL)

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

# SQLAlchemy setup
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
    try:
        with create_connection() as conn:
            print("Reading data from Users table...")
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Users;")
            rows = cursor.fetchall()
            for row in rows:
                print(f'row= {row}')
                print()
    except Exception as e:
        print(f"Error reading from Users table: {e}")

#user Management for future implementations
def verifyLogin(userID, userPassword):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC dbo.verifyLogin ?, ?", userID, userPassword)

            result = cursor.fetchone()

            if result:
                print(f"Login result: {result[0]}")  
                return True
            else:
                print("Login failed! No data returned.")
                return False
    except Exception as e:
        print(f"WOMP WOMP - Error: {e}")
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

#Listing management for future work
def newListing(aListUser, alistname, listCategory, alistdescription, aListClaimDescription, aIsClaimed, aListPicture, alistPicture2):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "EXEC newListing ?, ?, ?, ?, ?, ?, ?, ?",
                (aListUser, alistname, listCategory, alistdescription, aListClaimDescription, aIsClaimed, aListPicture, alistPicture2)
            )
            conn.commit()
            print("New listing created successfully!")
    except Exception as e:
        print(f"Error inserting new listing: {e}")

def approve_listing(listID):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC approveListing ?", listID)
            conn.commit()
            print("Listing has been successfully approved!")
    except Exception as e:
        print(f"Error approving listing: {e}")


def reject_listing(listID):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC dontApproveListing ?", listID)
            conn.commit()
            print("Listing has been successfully rejected!")
    except Exception as e:
        print(f"Error rejecting listing: {e}")


def delete_approved_listing(listID):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC deleteApprovedListing ?", listID)
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

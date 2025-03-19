import pyodbc
import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

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


def verifyLogin(userID, userPassword):
    try:
        with create_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("EXEC dbo.verifyLogin ?, ?", userID, userPassword)

            # Fetch result if the procedure returns data
            result = cursor.fetchone()

            if result:
                print(f"Login result: {result[0]}")  # Modify based on expected output
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

# Run functions for testing
if __name__ == '__main__':
    choice = input("Choose function to run (read, login, newUser, newListing): ").strip().lower()

    if choice == "read":
        read()
    elif choice == "login":
        user_id = input("Enter User ID: ")
        password = input("Enter Password: ")
        verifyLogin(user_id, password)
    elif choice == "newuser":
        user_id = input("Enter User ID: ")
        email = input("Enter Email: ")
        password = input("Enter Password: ")
        is_admin = int(input("Is Admin (0/1): "))
        first_name = input("Enter First Name: ")
        last_name = input("Enter Last Name: ")
        is_student = int(input("Is Student (0/1): "))
        newUser(user_id, email, password, is_admin, first_name, last_name, is_student)
    elif choice == "newlisting":
        list_user = input("Enter List User: ")
        list_name = input("Enter List Name: ")
        category = int(input("Enter Category: "))
        description = input("Enter Description: ")
        claim_description = input("Enter Claim Description: ")
        is_claimed = int(input("Is Claimed (0/1): "))
        picture1 = input("Enter Picture 1 URL: ")
        picture2 = input("Enter Picture 2 URL: ")
        newListing(list_user, list_name, category, description, claim_description, is_claimed, picture1, picture2)
    else:
        print("Invalid choice. Exiting.")
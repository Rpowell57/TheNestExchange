import pyodbc
import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy import text
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

# Correct pyodbc connection
connection = pyodbc.connect(
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=nestexchange.database.windows.net;"
    "DATABASE=nestExchange;"
    "UID=nestadmin@nestexchange;"
    "PWD=Nestexchange25;"
    "Encrypt=yes;"
    "TrustServerCertificate=no;"
    "Connection Timeout=30;"
)



# Create engine and session with error handling
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("Database connection successful!")
except Exception as e:
    print(f"Database connection failed: {e}")

# Dependency for database session

# ✅ Read function (moved outside of test_connection)
def read(connection):
    try:
    
        print("Reading data from Users table...")
        cursor = connection.cursor()
        cursor.execute(("SELECT * FROM Users;"))
        rows = cursor.fetchall()
        for row in rows:
            print(f'row= {row}')
            print()
    except Exception as e:
        print(f"Error reading from Users table: {e}")
    finally:
        if connection: 
            connection.close()

if __name__ == "__main__":
       read(connection)

'''
def newUser(connection):
    try:
    
        print("Reading data from Users table...")
        cursor = connection.cursor()
        userID = NULL
        userEmail = NULL
        userPassword = NULL
        userIsAdmin = NULL
        userFirstName = NULL
        userLastName = NULL
        userIsStudent = NULL
        cursor.execute("{CALL newUser(?,?,?,?,?,?,?)}", (userID),(userEmail),(userIsAdmin), (userIsAdmin), (userFirstName), (userLastName), (userIsStudent))
        connection.commit()
        print('succesfully committed')

        
    except Exception as e:
        print(f"Error reading from Users table: {e}")
    finally:
        if connection: 
            connection.close()

if __name__ == "__main__":
      newUser(connection)
      '''

#  Verify login function
def verifyLogin(connection, userID, userPassword):
    try:
        cursor = connection.cursor()

       
        cursor.execute("EXEC verifyLogin ?, ?", 'test','test')

        #  Fetch result if the procedure returns data
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


if __name__ == '__main__':
    if connection:
        user_id = input("Enter User ID: ")
        password = input("Enter Password: ")
        verifyLogin(connection, user_id, password)
import webbrowser
import threading
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from database import get_db
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Define allowed origins for security
origins = [
    "http://localhost:5173",  # React Dev Server
    "https://yourfrontend.com"  # Add production frontend URL
]

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Root Endpoint (Welcome Message)
@app.get("/")
def read_root():
    return {"message": "Welcome to The Nest Exchange API!"}

# User Creation Endpoint
@app.post("/users/create")
def create_user(
    userID: str, 
    userEmail: str, 
    userPassword: str, 
    userIsAdmin: int, 
    userFirstName: str, 
    userLastName: str, 
    userIsStudent: int, 
    db: Session = Depends(get_db)
):
    try:
        query = text("EXEC newUser :userID, :userEmail, :userPassword, :userIsAdmin, :userFirstName, :userLastName, :userIsStudent")
        db.execute(query, {
            "userID": userID,
            "userEmail": userEmail,
            "userPassword": userPassword,
            "userIsAdmin": userIsAdmin,
            "userFirstName": userFirstName,
            "userLastName": userLastName,
            "userIsStudent": userIsStudent
        })
        db.commit()
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User Login Verification Endpoint
from pydantic import BaseModel

class LoginRequest(BaseModel):
    userID: str
    userPassword: str

@app.post("/users/login")
def verify_login(login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        query = text("EXEC verifyLogin :userID, :userPassword")
        result = db.execute(query, {
            "userID": login_data.userID, 
            "userPassword": login_data.userPassword
        }).fetchone()

        if result and result[0]:  # Ensure first value exists
            return {"message": "Login successful", "userID": login_data.userID}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Automatically open Swagger UI when the server starts
def open_browser():
    import time
    time.sleep(1)  # Give server time to start
    webbrowser.open("http://127.0.0.1:8000/docs")

threading.Thread(target=open_browser).start()


# Create a new Listing
@app.post("/listings/create")
def create_listing(
    listUserID: str,
    listDate: str,
    listCategory: int,
    listDescription: str,
    listClaimDescription: str,
    isClaimed: int,
    listPicture: str,
    listPicture2: str,
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            INSERT INTO ListingTable (listUserID, listDate, listCategory, listDescription, 
                                      listClaimDescription, isClaimed, listPicture, listPicture2)
            VALUES (:listUserID, :listDate, :listCategory, :listDescription, 
                    :listClaimDescription, :isClaimed, :listPicture, :listPicture2)
        """)
        db.execute(query, {
             "listUserID": listUserID,
            "listDate": listDate,
            "listCategory": listCategory,
            "listDescription": listDescription,
            "listClaimDescription": listClaimDescription,
            "isClaimed": isClaimed,
            "listPicture": listPicture,
            "listPicture2": listPicture2
        })
        db.commit()
        return{"message: Listing was create successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

     

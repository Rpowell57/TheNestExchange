import webbrowser
import threading
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from database import get_db
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import File, UploadFile, Form
import shutil
#from database import upload_image_to_blob



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
class UserCreate(BaseModel):
    userID: str
    userEmail: str
    userPassword: str
    userIsAdmin: int
    userFirstName: str
    userLastName: str
    userIsStudent: int

@app.post("/users/create")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        query = text("EXEC newUser :userID, :userEmail, :userPassword, :userIsAdmin, :userFirstName, :userLastName, :userIsStudent")
        db.execute(query, {
            "userID": user.userID,
            "userEmail": user.userEmail,
            "userPassword": user.userPassword,
            "userIsAdmin": user.userIsAdmin,
            "userFirstName": user.userFirstName,
            "userLastName": user.userLastName,
            "userIsStudent": user.userIsStudent
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


@app.post("/listings/create")
async def create_listing(
    listUserID: str,
    listDate: str,
    listCategory: int,
    listDescription: str,
    listClaimDescription: str,
    isClaimed: int,
    listPicture: UploadFile = File(...),
    listPicture2: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Save images to Azure Blob Storage
        picture_url = upload_image_to_blob(listPicture.file, listPicture.filename)
        picture2_url = upload_image_to_blob(listPicture2.file, listPicture2.filename)

        if not picture_url or not picture2_url:
            raise HTTPException(status_code=500, detail="Image upload failed")

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
            "listPicture": picture_url,
            "listPicture2": picture2_url
        })
        db.commit()

        return {"message": "Listing created successfully", "listPicture": picture_url, "listPicture2": picture2_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#Listing approve
@app.post("/listings/approve")
def approve_listing(listID: int = Form(...), db: Session = Depends(get_db)):
    query = test("EXEC approveListing :listID")
    db.execute(query, {"listID":listID})
    db.commit()
    return {"message": "The listing has been approved!"}     

#Listing Reject
@app.post("/listings/reject")
def reject_listing(listID: int = Form(...), db: Session = Depends(get_db)):
    query = test("EXEC dontApproveListing :listID")
    db.execute(query, {"listID":listID})
    db.commit()
    return {"message": "The listing has been rejected."}     

#Listing Delete
@app.post("/listings/delete")
def reject_listing(listID: int = Form(...), db: Session = Depends(get_db)):
    query = test("EXEC deleteApproveListing :listID")
    db.execute(query, {"listID" :listID})
    db.commit()
    return {"message": "The listing has been deleted."}     

#Claiming listings
@app.post("/listings/claim")
def claim_item(
    claimListId: int = Form(...),
    claimedUserID: str = Form(...),
    claimedReview: str = Form(...),
    claimedRating: int = Form(...),
    db: Session = Depends(get_db)
):
    query = text("EXEC claimItem :claimListId, :claimedUserID, :claimedReview, :claimedRating")
    db.execute(query,{
        "claimListId": claimListId,
        "claimedUserID": claimedUserID,
        "claimedReview": claimedReview,
        "claimedRating": claimedRating
    })
    db.commit()
    return {"message": "Item has been successfully claimed!"}

#Items marked as sold/claimed.
@app.post("/listings/sell")
def sell_item(
    soldListId: int = Form(...),
    soldReview: str = Form(...),
    soldRating: int = Form(...),
    db: Session = Depends(get_db)
):
    query = text ("EXEC soldItem :soldListId, :soldReview, :soldRating")
    db.execute(query,{
        "soldListId": soldListId,
        "soldReview": soldReview,
        "soldRating": soldRating
    })
    db.commit()
    return{"Message": "This Item has been marked as sold/claimed!"}
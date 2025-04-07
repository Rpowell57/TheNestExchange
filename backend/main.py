import os
import redis
import webbrowser
import threading
import json
from azure.core.exceptions import AzureError
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from database import get_db
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
from database import upload_image_to_blob

# Load environment variables
load_dotenv()

# Retrieve Azure Storage variables
AZURE_STORAGE_SAS_URL = os.getenv("AZURE_STORAGE_SAS_URL")
AZURE_STORAGE_CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME")

if not AZURE_STORAGE_SAS_URL:
    raise ValueError("AZURE_STORAGE_SAS_URL is not set. Check your .env file.")

# Initialize Blob Service Client using SAS URL
blob_service_client = BlobServiceClient(account_url=AZURE_STORAGE_SAS_URL)

import traceback





# Redis Configuration
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

# Initialize Redis Client
redis_client = redis.StrictRedis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    ssl=True,
    decode_responses=True
)

# Test Redis Connection
def test_redis():
    try:
        redis_client.set("test_key", "Redis connection successful!")
        print("Redis is connected!")
    except Exception as e:
        print(f"Redis connection failed: {e}")

test_redis()

app = FastAPI()

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    image_url = upload_image_to_blob(file.file, file.filename)
    if image_url:
        return {"image_url": image_url}
    else:
        raise HTTPException(status_code=500, detail="Image upload failed.")

# Define allowed origins for security
origins = [
    "http://localhost:5173",  
    "https://yourfrontend.com"  
]

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.get("/")
def read_root():
    return {"message": "Welcome to The Nest Exchange API!"}

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
    
        query = text("""
            EXEC newUser :userID, :userEmail, :userPassword, :userIsAdmin, :userFirstName, :userLastName, :userIsStudent
        """)
        
        db.execute(query, user.dict())
        db.commit()

        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class LoginRequest(BaseModel):
    userID: str
    userPassword: str

@app.post("/users/login")
def verify_login(login_data: LoginRequest, db: Session = Depends(get_db)):
    cache_key = f"user:{login_data.userID}:auth"
    cached_result = redis_client.get(cache_key)
    
    if cached_result:
        print("Cache hit for user login verification!")
        return {"message": "Login successful", "userID": login_data.userID} if cached_result == "True" else HTTPException(status_code=401, detail="Invalid credentials")
    
    try:
        query = text("""
            EXEC verifyLogin :userID, :userPassword
        """)
        result = db.execute(query, login_data.dict()).fetchone()

        if result and result[0]:  
            admin_check_query = text("""
                SELECT userIsAdmin FROM Users WHERE userID = :userID
            """)
            admin_result = db.execute(admin_check_query, {"userID": login_data.userID}).fetchone()

            if admin_result and admin_result[0] == 1:  # Check if the user is an admin
                is_admin = True
            else:
                is_admin = False

            redis_client.setex(cache_key, 3600, "True")  
            return {"message": "Login successful", "userID": login_data.userID, "isAdmin": is_admin}
        else:
            redis_client.setex(cache_key, 3600, "False") 
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



def open_browser():
    import time
    time.sleep(1)  
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
        # Read and upload image 1
        picture_data = await listPicture.read()
        picture_filename = f"{uuid.uuid4()}{os.path.splitext(listPicture.filename)[1]}"
        picture_url = upload_image_to_blob(picture_data, picture_filename)

        # Read and upload image 2
        picture2_data = await listPicture2.read()
        picture2_filename = f"{uuid.uuid4()}{os.path.splitext(listPicture2.filename)[1]}"
        picture2_url = upload_image_to_blob(picture2_data, picture2_filename)

        # Insert into database
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

        # Invalidate cache
        redis_client.delete("listings:all")

        return {
            "message": "Listing created successfully",
            "listPicture": picture_url,
            "listPicture2": picture2_url
        }

    except Exception as e:
        print(f"Error creating listing: {e}")
        raise HTTPException(status_code=500, detail="Error creating listing")


@app.post("/test/upload-image")
async def test_image_upload(image: UploadFile = File(...)):
    try:
        # Read the image file content asynchronously
        image_data = await image.read()

        # Generate a filename for the image
        filename = image.filename

        # Upload the image to Azure Blob Storage
        image_url = upload_image_to_blob(image_data, filename)

        if image_url:
            return {"message": "Image uploaded successfully", "image_url": image_url}
        else:
            raise HTTPException(status_code=500, detail="Image upload failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



#Listing approve
@app.post("/listings/approve")
def approve_listing(listID: int = Form(...), db: Session = Depends(get_db)):
    try:
        query = text("EXEC approveListing :listID")
        db.execute(query, {"listID": listID})
        db.commit()

        # Remove cached listings to refresh data
        redis_client.delete("listings:all")

        return {"message": "The listing has been approved!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
  

#Listing Reject
@app.post("/listings/reject")
def reject_listing(listID: int = Form(...), db: Session = Depends(get_db)):
    try:
        query = text("EXEC dontApproveListing :listID")
        db.execute(query, {"listID": listID})
        db.commit()

        # Remove cached listings
        redis_client.delete("listings:all")

        return {"message": "The listing has been rejected."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
   

#Listing Delete
@app.post("/listings/delete")
def delete_listing(listID: int = Form(...), db: Session = Depends(get_db)):
    try:
        query = text("EXEC deleteApproveListing :listID")
        db.execute(query, {"listID": listID})
        db.commit()

        # Invalidate cache after deleting a listing
        redis_client.delete("listings:all")

        return {"message": "The listing has been deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#Claiming listings
@app.post("/claim/{listing_id}")
def claim_listing(
    listing_id: int,
    claimedUserID: str = Form(...),
    claimedReview: str = Form(...),
    claimedRating: int = Form(...),
    db: Session = Depends(get_db)
):
    try:
        query = text("EXEC claimItem :listing_id, :claimedUserID, :claimedReview, :claimedRating")
        db.execute(query, {
            "listing_id": listing_id,
            "claimedUserID": claimedUserID,
            "claimedReview": claimedReview,
            "claimedRating": claimedRating
        })
        db.commit()

        # Invalidate cache
        redis_client.delete("listings:all")

        return {"message": "Item has been successfully claimed!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



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
from datetime import date

@app.get("/listings")
def get_listings(db: Session = Depends(get_db)):
    cache_key = "listings:all"
    cached_listings = redis_client.get(cache_key)

    if cached_listings:
        print("Cache hit for listings!")
        try:
            listings = json.loads(cached_listings)
            return listings
        except json.JSONDecodeError:
            print("Error: Cached listings data is not valid JSON")
            return []  # Return an empty list or handle the error gracefully
    else:
        try:
            # Adjust the query to filter only approved listings (e.g., isClaimed = 1)
            query = text("""
                SELECT id, listUserID, listDate, listCategory, listDescription, 
                       listClaimDescription, isClaimed, listPicture, listPicture2 
                FROM ListingTable
                WHERE isClaimed = 1  -- Only fetch approved listings
            """)
            result = db.execute(query).fetchall()

            listings = [
                {
                    "id": row.id,
                    "listUserID": row.listUserID,
                    "listDate": row.listDate.strftime("%Y-%m-%d") if isinstance(row.listDate, date) else row.listDate,
                    "listCategory": row.listCategory,
                    "listDescription": row.listDescription,
                    "listClaimDescription": row.listClaimDescription,
                    "isClaimed": row.isClaimed,
                    "listPicture": row.listPicture if row.listPicture else "",
                    "listPicture2": row.listPicture2 if row.listPicture2 else "",
                }
                for row in result
            ]

            # Cache only metadata, not the images
            redis_client.setex(cache_key, 600, json.dumps([{
                "id": listing["id"],
                "listUserID": listing["listUserID"],
                "listDate": listing["listDate"],
                "listCategory": listing["listCategory"],
                "listDescription": listing["listDescription"],
                "listClaimDescription": listing["listClaimDescription"],
                "isClaimed": listing["isClaimed"]
            } for listing in listings]))  # Store as a valid JSON string

            return listings
        except Exception as e:
            print(f"Error fetching listings: {e}")
            raise HTTPException(status_code=500, detail=str(e))



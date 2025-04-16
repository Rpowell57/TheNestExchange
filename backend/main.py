import os
import redis
import webbrowser
import threading
import json
import uuid
import traceback
from datetime import date
from fastapi import Body
from azure.core.exceptions import AzureError
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from sqlalchemy import text
from database import get_db, newListing, get_all_listings, get_unclaimed_listings
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from dotenv import load_dotenv
from database import upload_image_to_blob
app = FastAPI()
# Load environment variables
load_dotenv()
router = APIRouter()


# Retrieve Azure Storage variables
AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
AZURE_STORAGE_SAS_TOKEN = os.getenv("AZURE_STORAGE_SAS_TOKEN")
AZURE_STORAGE_CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME")

if not AZURE_STORAGE_ACCOUNT_NAME or not AZURE_STORAGE_SAS_TOKEN or not AZURE_STORAGE_CONTAINER_NAME:
    raise ValueError("Azure storage details not set. Check your .env file.")

# Initialize Blob Service Client using SAS URL
account_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net"
blob_service_client = BlobServiceClient(account_url=account_url, credential=AZURE_STORAGE_SAS_TOKEN)


def upload_image_to_blob(file, filename):
    try:
        # Initialize BlobClient using container name and blob filename
        blob_client = blob_service_client.get_blob_client(
            container=AZURE_STORAGE_CONTAINER_NAME, blob=filename)

        # Upload the file to the blob storage
        blob_client.upload_blob(file, overwrite=True)
        
        # Return the URL of the uploaded blob
        return f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_STORAGE_CONTAINER_NAME}/{filename}"

    except Exception as e:
        print(f"Error uploading to Azure Blob: {e}")
        return None
    

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Read file and generate filename
        file_data = await file.read()
        filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"

        # Upload image to Azure Blob and get the URL
        image_url = upload_image_to_blob(file_data, filename)
        if image_url:
            return {"image_url": image_url}
        else:
            raise HTTPException(status_code=500, detail="Image upload failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")

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
    decode_responses=True,
    socket_timeout=5,                    
    socket_connect_timeout=5,            
    retry_on_timeout=True
)

# Test Redis Connection
def test_redis():
    try:
        redis_client.set("test_key", "Redis connection successful!")
        print("Redis is connected!")
    except Exception as e:
        print(f"Redis connection failed: {e}")

test_redis()

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
    listUserID: str= Form(...),
    listDate: str= Form(...),
    listCategory: int = Form(...),
    listDescription: str= Form(...),
    listClaimDescription: str = Form(...),
    isClaimed: int = Form(...),
    listPicture: UploadFile = File(...),
    listPicture2: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        
        picture_data = await listPicture.read()
        picture_filename = f"{uuid.uuid4()}{os.path.splitext(listPicture.filename)[1]}"
        picture_url = upload_image_to_blob(picture_data, picture_filename)  
 
        picture2_data = await listPicture2.read()
        picture2_filename = f"{uuid.uuid4()}{os.path.splitext(listPicture2.filename)[1]}"
        picture2_url = upload_image_to_blob(picture2_data, picture2_filename) 

        newListing(
        aListUser=listUserID,
            alistname=listDate,  
            listCategory=listCategory,
            alistdescription=listDescription,
            aListClaimDescription=listClaimDescription,
            aIsClaimed=isClaimed,
            aListPicture=picture_url,
            alistPicture2=picture2_url
       )
        redis_client.delete("listings:all")
        return {
            "message": "Listing created successfully",
            "listPicture": picture_url,
            "listPicture2": picture2_url
        }
    except Exception as e:
        traceback.print_exc()
        print(f"Error creating listing: {e}")
        raise HTTPException(status_code=500, detail="Error creating listing")



@app.post("/test/upload-image")
async def test_image_upload(image: UploadFile = File(...)):
    try:
        
        image_data = await image.read()

        filename = image.filename

        image_url = upload_image_to_blob(image_data, filename)

        if image_url:
            return {"message": "Image uploaded successfully", "image_url": image_url}
        else:
            raise HTTPException(status_code=500, detail="Image upload failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Create a router
router = APIRouter()

@router.get("/listings/pending")
def get_pending_listings(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT alistID, aListUserID, aListDate, aListCategory, aListdescription, 
                   aListClaimDescription, aIsClaimed, aListPicture, aListPicture2 
            FROM dbo.unaprovedListings  -- Correct table name with schema
            WHERE aIsClaimed = 0  -- Pending approval
        """)
        result = db.execute(query).fetchall()

        listings = [
            {
                "id": row.alistID,
                "listUserID": row.aListUserID,
                "listDate": row.aListDate.strftime("%Y-%m-%d"),
                "listCategory": row.aListCategory,
                "listDescription": row.aListdescription,
                "listClaimDescription": row.aListClaimDescription,
                "isClaimed": row.aIsClaimed,
                "listPicture": row.aListPicture,
                "listPicture2": row.aListPicture2,
            }
            for row in result
        ]
        return listings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/listings/approve")
def approve_listing(listID: int = Form(...), db: Session = Depends(get_db)):
    try:
        query = text("EXEC approveListing :listID")
        db.execute(query, {"listID": listID})
        db.commit()

        redis_client.setex(f"listing:{listID}:approved", 3600, "True")
        return {"message": "Listing has been approved!"}
    except Exception as e:
        print(f"Error approving listing: {e}")
        raise HTTPException(status_code=500, detail="Error approving listing")

@router.post("/listings/reject")
def reject_listing(listID: int = Form(...), db: Session = Depends(get_db)):
    try:
        query = text("EXEC dontApproveListing :listID")
        db.execute(query, {"listID": listID})
        db.commit()

        redis_client.delete(f"listing:{listID}:approved")
        return {"message": "Listing has been rejected!"}
    except Exception as e:
        print(f"Error rejecting listing: {e}")
        raise HTTPException(status_code=500, detail="Error rejecting listing")

@router.delete("/listings/{listID}")
def delete_listing(listID: int, db: Session = Depends(get_db)):
    try:
        query = text("EXEC delteApprovedListing :listID")
        db.execute(query, {"listID": listID})
        db.commit()

        # Remove the listing from Redis cache
        redis_client.delete(f"listing:{listID}")

        return {"message": "Listing has been deleted."}
    except Exception as e:
        print(f"Error deleting listing: {e}")
        raise HTTPException(status_code=500, detail="Error deleting listing")


@router.post("/claim/{listing_id}")
def claim_listing(
    listing_id: int,
    claimedUserID: str = Form(...),
    claimedReview: str = Form(...),
    claimedRating: int = Form(...),
    db: Session = Depends(get_db)
):
    try:
        query = text("EXEC claimItem :claimListId, :claimedUserID, :claimedReview, :claimedRating")
        db.execute(query, {
            "claimListId": listing_id,
            "claimedUserID": claimedUserID,
            "claimedReview": claimedReview,
            "claimedRating": claimedRating
        })
        db.commit()

        redis_client.delete("listings:all")
        return {"message": "Item has been successfully claimed!"}
    except Exception as e:
        print(f"Error claiming item: {e}")
        raise HTTPException(status_code=500, detail="Error claiming item")


@router.post("/listings/sell")
def sell_item(
    soldListId: int = Form(...),
    soldReview: str = Form(...),
    soldRating: int = Form(...),
    db: Session = Depends(get_db)
):
    try:
        query = text("EXEC soldItem :soldListId, :soldReview, :soldRating")
        db.execute(query, {
            "soldListId": soldListId,
            "soldReview": soldReview,
            "soldRating": soldRating
        })
        db.commit()

        return {"Message": "Item marked as sold!"}
    except Exception as e:
        print(f"Error marking item as sold: {e}")
        raise HTTPException(status_code=500, detail="Error marking item as sold")

@router.get("/listings")
def read_all_listings(db: Session = Depends(get_db)):
    cache_key = "listings:all"
    cached_listings = redis_client.get(cache_key)

    if cached_listings:
        print("Cache hit for listings!")
        try:
            listings = json.loads(cached_listings)
            return listings
        except json.JSONDecodeError:
            print("Error: Cached listings data is not valid JSON")
            return []  #
    else:
        try:
            listings = get_all_listings(db)
            redis_client.setex(cache_key, 600, json.dumps(listings))

            return listings
        except Exception as e:
            print(f"Error fetching listings: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/listings/unclaimed")
def fetch_unclaimed_listings():
    try:
        listings = get_unclaimed_listings()
        return listings
    except Exception as e:
        print(f"API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch unclaimed listings")

            

@router.get("/sold/{list_user_id}")
def get_sold_items(list_user_id: str, db: Session = Depends(get_db)):
    try:
        sold_listings = all_sold_for_specific_user(db, list_user_id)
        if not sold_listings:
            raise HTTPException(status_code=404, detail="No sold items found for this user.")
        return sold_listings
    except Exception as e:
        print(f"Error fetching sold listings: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

#
@router.get("/claimed/{list_user_id}")
def get_claimed_items(list_user_id: str, db: Session = Depends(get_db)):
    try:
        claimed_listings = all_claimed_for_specific_user(db, list_user_id)
        if not claimed_listings:
            raise HTTPException(status_code=404, detail="No claimed items found for this user.")
        return claimed_listings
    except Exception as e:
        print(f"Error fetching claimed listings: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


app.include_router(router, prefix="/api")

@app.get("/users/check-admin")
def check_if_admin(userID: str, db: Session = Depends(get_db)):
    try:
        query = text("SELECT userIsAdmin FROM Users WHERE userID = :userID")
        result = db.execute(query, {"userID": userID}).fetchone()
        return {"isAdmin": result[0] == 1 if result else False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    




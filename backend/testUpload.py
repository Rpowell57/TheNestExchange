import os
from azure.storage.blob import BlobServiceClient

# Load environment variables
connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME")
test_file_path = "IMG_4447.jpeg"  # Replace with an actual file path

if not connection_string or not container_name:
    print("❌ Azure environment variables not set correctly!")
    exit()

try:
    # Connect to Blob Storage
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    container_client = blob_service_client.get_container_client(container_name)

    # Upload test image
    blob_name = "test_upload.jpeg"
    with open(test_file_path, "rb") as data:
        blob_client = container_client.get_blob_client(blob_name)
        blob_client.upload_blob(data, overwrite=True)

    print(f"✅ Image uploaded successfully to {blob_client.url}")

except Exception as e:
    print(f"❌ Image upload failed: {e}")

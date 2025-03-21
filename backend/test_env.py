import os
from dotenv import load_dotenv

load_dotenv()

print("AZURE_STORAGE_CONNECTION_STRING:", os.getenv("AZURE_STORAGE_CONNECTION_STRING"))
print("AZURE_STORAGE_CONTAINER_NAME:", os.getenv("AZURE_STORAGE_CONTAINER_NAME"))

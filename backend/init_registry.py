import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def init_registry():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing registry
    await db.registry.delete_many({})
    
    # Initialize gift items
    items = [
        {
            "id": "plates",
            "name": "Plates",
            "link": "https://shopee.com.my",
            "total": 100.0,
            "contributed": 0.0,
            "contributions": []
        },
        {
            "id": "carpet",
            "name": "Carpet",
            "link": "https://shopee.com.my",
            "total": 200.0,
            "contributed": 0.0,
            "contributions": []
        },
        {
            "id": "electric-grinder",
            "name": "Electric Grinder",
            "link": "https://shopee.com.my",
            "total": 2000.0,
            "contributed": 0.0,
            "contributions": []
        },
        {
            "id": "bicycle",
            "name": "Bicycle",
            "link": "https://shopee.com.my",
            "total": 1000.0,
            "contributed": 0.0,
            "contributions": []
        }
    ]
    
    await db.registry.insert_many(items)
    print("Registry initialized successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_registry())

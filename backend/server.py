from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import csv
import io


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class RSVPCreate(BaseModel):
    name: str
    pax: int
    wishes: str

class RSVP(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    pax: int
    wishes: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Contribution(BaseModel):
    contributor_name: str
    amount: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GiftItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    link: str
    total: float
    contributed: float = 0.0
    contributions: List[Contribution] = []

class ContributionCreate(BaseModel):
    item_id: str
    contributor_name: str
    amount: float

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Ana & Faris Wedding API"}

# RSVP Routes
@api_router.post("/rsvp", response_model=RSVP)
async def create_rsvp(input: RSVPCreate):
    rsvp_obj = RSVP(**input.model_dump())
    
    doc = rsvp_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.rsvps.insert_one(doc)
    return rsvp_obj

@api_router.get("/rsvp", response_model=List[RSVP])
async def get_rsvps():
    rsvps = await db.rsvps.find({}, {"_id": 0}).to_list(1000)
    
    for rsvp in rsvps:
        if isinstance(rsvp['timestamp'], str):
            rsvp['timestamp'] = datetime.fromisoformat(rsvp['timestamp'])
    
    return rsvps

# Gift Registry Routes
@api_router.get("/registry", response_model=List[GiftItem])
async def get_registry():
    items = await db.registry.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO timestamps back to datetime
    for item in items:
        for contrib in item.get('contributions', []):
            if isinstance(contrib['timestamp'], str):
                contrib['timestamp'] = datetime.fromisoformat(contrib['timestamp'])
    
    return items

@api_router.post("/registry/contribute")
async def add_contribution(input: ContributionCreate):
    item = await db.registry.find_one({"id": input.item_id}, {"_id": 0})
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    contribution = Contribution(
        contributor_name=input.contributor_name,
        amount=input.amount
    )
    
    new_contributed = item.get('contributed', 0) + input.amount
    
    # Don't allow over-contribution
    if new_contributed > item['total']:
        raise HTTPException(status_code=400, detail="Contribution exceeds item total")
    
    contrib_dict = contribution.model_dump()
    contrib_dict['timestamp'] = contrib_dict['timestamp'].isoformat()
    
    await db.registry.update_one(
        {"id": input.item_id},
        {
            "$set": {"contributed": new_contributed},
            "$push": {"contributions": contrib_dict}
        }
    )
    
    return {"message": "Contribution added successfully", "new_total": new_contributed}

@api_router.post("/registry/upload-csv")
async def upload_registry_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file to update the registry.
    CSV format: Item_name, Link, Total, Contributor, Amount, Timestamp
    If Contributor = 0, it's a new item with no contributions.
    """
    try:
        # Read the CSV file
        contents = await file.read()
        decoded = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        # Group data by item
        items_dict = {}
        
        for row in csv_reader:
            item_name = row.get('Item_name', '').strip()
            link = row.get('Link', '').strip()
            total = float(row.get('Total', 0))
            contributor = row.get('Contributor', '').strip()
            amount = float(row.get('Amount', 0)) if row.get('Amount') else 0
            timestamp_str = row.get('Timestamp', '').strip()
            
            # Create item ID from name
            item_id = item_name.lower().replace(' ', '-')
            
            # Initialize item if not exists
            if item_id not in items_dict:
                items_dict[item_id] = {
                    'id': item_id,
                    'name': item_name,
                    'link': link,
                    'total': total,
                    'contributed': 0.0,
                    'contributions': []
                }
            
            # Add contribution if contributor is not "0"
            if contributor and contributor != "0":
                # Parse timestamp
                if timestamp_str:
                    try:
                        contrib_timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                    except:
                        contrib_timestamp = datetime.now(timezone.utc)
                else:
                    contrib_timestamp = datetime.now(timezone.utc)
                
                contribution = {
                    'contributor_name': contributor,
                    'amount': amount,
                    'timestamp': contrib_timestamp.isoformat()
                }
                items_dict[item_id]['contributions'].append(contribution)
                items_dict[item_id]['contributed'] += amount
        
        # Clear existing registry
        await db.registry.delete_many({})
        
        # Insert new items
        if items_dict:
            await db.registry.insert_many(list(items_dict.values()))
        
        return {
            "message": "Registry updated successfully",
            "items_count": len(items_dict),
            "total_contributions": sum(len(item['contributions']) for item in items_dict.values())
        }
        
    except Exception as e:
        logger.error(f"Error uploading CSV: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")

@api_router.post("/registry/upload-registry-list")
async def upload_registry_list(file: UploadFile = File(...)):
    """
    Upload a CSV file with just the registry items (no contributions).
    CSV format: Item,Link,Total
    """
    try:
        contents = await file.read()
        decoded = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        # Clear existing registry
        await db.registry.delete_many({})
        
        items = []
        for row in csv_reader:
            item_name = row.get('Item', '').strip()
            link = row.get('Link', '').strip()
            total = float(row.get('Total', 0))
            
            item_id = item_name.lower().replace(' ', '-')
            
            items.append({
                'id': item_id,
                'name': item_name,
                'link': link,
                'total': total,
                'contributed': 0.0,
                'contributions': []
            })
        
        if items:
            await db.registry.insert_many(items)
        
        return {
            "message": "Registry list updated successfully",
            "items_count": len(items)
        }
        
    except Exception as e:
        logger.error(f"Error uploading registry list: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")

@api_router.delete("/registry/{item_id}/contribution/{contribution_index}")
async def delete_contribution(item_id: str, contribution_index: int):
    """Delete a specific contribution from an item"""
    try:
        item = await db.registry.find_one({"id": item_id}, {"_id": 0})
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        if contribution_index >= len(item.get('contributions', [])):
            raise HTTPException(status_code=404, detail="Contribution not found")
        
        # Get the contribution to delete
        contribution = item['contributions'][contribution_index]
        amount_to_deduct = contribution['amount']
        
        # Remove the contribution
        item['contributions'].pop(contribution_index)
        
        # Update contributed total
        new_contributed = max(0, item.get('contributed', 0) - amount_to_deduct)
        
        await db.registry.update_one(
            {"id": item_id},
            {
                "$set": {
                    "contributions": item['contributions'],
                    "contributed": new_contributed
                }
            }
        )
        
        return {"message": "Contribution deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting contribution: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete contribution: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
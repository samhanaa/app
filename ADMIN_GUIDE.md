# Ana & Faris Wedding Website - Admin Guide

## How to Extract RSVP Data

You can extract RSVP responses from the database in two ways:

### Method 1: Using the API (Recommended)

Simply visit this URL in your browser or use curl:

```bash
curl https://anafaris-wedding.preview.emergentagent.com/api/rsvp
```

This will return a JSON array of all RSVP responses with:
- Guest name
- Number of guests (pax)
- Wishes/message
- Timestamp of submission

### Method 2: Direct MongoDB Access

If you have access to the server, you can query MongoDB directly:

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/test_database

# View all RSVPs
db.rsvps.find()

# Export to JSON file
mongoexport --db=test_database --collection=rsvps --out=rsvps_export.json
```

## Gift Registry Contributions

To view all contributions:

```bash
curl https://anafaris-wedding.preview.emergentagent.com/api/registry
```

This will show each gift item with:
- Item name and total cost
- Amount contributed so far
- List of contributors with their names and amounts
- Progress percentage

## Database Collections

The website uses MongoDB with two main collections:

1. **rsvps** - Stores all RSVP responses
2. **registry** - Stores gift items and their contributions

## Backup Data

To backup all wedding data:

```bash
mongodump --db=test_database --out=/path/to/backup
```

## Notes

- RSVP form automatically closes after July 24, 2026
- Gift contributions cannot exceed the item's total cost
- All timestamps are stored in UTC format
- Progress bars turn gold when items are fully funded

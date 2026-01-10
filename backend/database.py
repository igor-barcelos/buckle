from pymongo import MongoClient
from pymongo.database import Database
import os
from dotenv import load_dotenv
import pathlib

env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME", "buckle_db")

_client: MongoClient = None
_database: Database = None


def get_database() -> Database:
    global _database
    if _database is None:
        connect_to_database()
    return _database


def connect_to_database():
    global _client, _database
    try:
        _client = MongoClient(MONGODB_URL)
        _database = _client[MONGODB_DB_NAME]
        _client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {MONGODB_DB_NAME}")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise


def close_database():
    global _client, _database
    if _client:
        _client.close()
        _client = None
        _database = None
        print("✅ MongoDB connection closed")


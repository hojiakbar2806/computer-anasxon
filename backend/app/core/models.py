from bson import ObjectId
from app.database import db

def create_support_request(data):
    result = db.support_requests.insert_one(data)
    return str(result.inserted_id)

def get_support_request(request_id):
    return db.support_requests.find_one({"_id": ObjectId(request_id)})

def list_support_requests():
    return list(db.support_requests.find())

def update_support_request(request_id, data):
    db.support_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": data}
    )

def delete_support_request(request_id):
    db.support_requests.delete_one({"_id": ObjectId(request_id)})

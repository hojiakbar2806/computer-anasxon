from bson import ObjectId
from fastapi import HTTPException
from app.database.base import db
from app.utils.fix_obj_ids import fix_object_ids


class SupportRequests:
    collection = db.support_requests

    @classmethod
    def create(cls, data: dict):
        cls.collection.insert_one(data).inserted_id
        return fix_object_ids(data)

    @classmethod
    def get_by_id(cls, req_id: str):
        if ObjectId.is_valid(req_id) is False:
            raise HTTPException(404, "Support request not found")
        doc = cls.collection.find_one({"_id": ObjectId(req_id)})
        return fix_object_ids(doc) if doc else None

    @classmethod
    def get_by_owner_id(cls, owner_id: str):
        if ObjectId.is_valid(owner_id) is False:
            raise HTTPException(404, "User not found")
        docs = list(cls.collection.find({"owner._id": ObjectId(owner_id)}))
        return [fix_object_ids(d) for d in docs]

    @classmethod
    def list(cls, filter: dict = {}):
        docs = list(cls.collection.find(filter))
        return [fix_object_ids(d) for d in docs]

    @classmethod
    def update(cls, req_id: str, data: dict):
        if ObjectId.is_valid(req_id) is False:
            raise HTTPException(404, "Support request not found")
        result = cls.collection.update_one(
            {"_id": ObjectId(req_id)}, {"$set": data})
        if result.matched_count == 0:
            raise HTTPException(404, "Support request not found")
        return {"modified_count": result.modified_count}

    @classmethod
    def delete(cls, req_id: str):
        if ObjectId.is_valid(req_id) is False:
            raise HTTPException(404, "Support request not found")
        result = cls.collection.delete_one({"_id": ObjectId(req_id)})
        if result.deleted_count == 0:
            raise HTTPException(404, "Support request not found")
        return {"deleted_count": result.deleted_count}

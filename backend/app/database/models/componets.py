from bson import ObjectId
from fastapi import HTTPException
from app.database.base import db
from app.utils.fix_obj_ids import fix_object_ids


class Components:
    collection = db.components

    @classmethod
    def create(cls, data: dict):
        inserted_id = cls.collection.insert_one(data).inserted_id
        return {"id": str(inserted_id)}

    @classmethod
    def get_by_id(cls, component_id: str):
        if ObjectId.is_valid(component_id) is False:
            raise HTTPException(404, "Component not found")
        doc = cls.collection.find_one({"_id": ObjectId(component_id)})
        return fix_object_ids(doc) if doc else None

    @classmethod
    def list(cls, filter: dict = {}):
        docs = list(cls.collection.find(filter))
        return [fix_object_ids(d) for d in docs]

    @classmethod
    def update(cls, component_id: str, data: dict):
        if ObjectId.is_valid(component_id) is False:
            raise HTTPException(404, "Component not found")
        result = cls.collection.update_one(
            {"_id": ObjectId(component_id)}, {"$set": data})
        if result.matched_count == 0:
            raise HTTPException(404, "Component not found")
        return {"modified_count": result.modified_count}

    @classmethod
    def delete(cls, component_id: str):
        if ObjectId.is_valid(component_id) is False:
            raise HTTPException(404, "Component not found")
        result = cls.collection.delete_one({"_id": ObjectId(component_id)})
        if result.deleted_count == 0:
            raise HTTPException(404, "Component not found")
        return {"deleted_count": result.deleted_count}

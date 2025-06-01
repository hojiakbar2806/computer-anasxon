from datetime import datetime
import math
import secrets
from bson import ObjectId
from app.database.base import db
from passlib.context import CryptContext

from app.utils.fix_obj_ids import fix_object_ids

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Users:
    collection = db.users

    @classmethod
    def get(cls, filters: dict = {}):
        return cls.collection.find_one(filters)

    @classmethod
    def get_all(cls, filters: dict = {}):
        users = cls.collection.find(filters)
        return [fix_object_ids(user) for user in users]

    @classmethod
    def update(cls, user_id: str, data: dict):
        return cls.collection.update_one({"_id": ObjectId(user_id)}, {"$set": data})

    @classmethod
    def delete(cls, user_id: str):
        return cls.collection.delete_one({"_id": ObjectId(user_id)})

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def create(cls, user_data: dict):
        if not user_data.get("password"):
            random_password = math.floor(secrets.randbelow(1000000000))
            user_data["password"] = str(random_password)
            user_data["created_at"] = datetime.now()
        else:
            random_password = None

        user_data["password"] = cls.hash_password(user_data["password"])
        inserted_id = cls.collection.insert_one(user_data).inserted_id
        return inserted_id, random_password

    @classmethod
    def get_by_email(cls, email: str):
        return cls.collection.find_one({"email": email})

    @classmethod
    def get_by_id(cls, user_id: str):
        user = cls.collection.find_one({"_id": ObjectId(user_id)})
        print(user)
        return fix_object_ids(user)

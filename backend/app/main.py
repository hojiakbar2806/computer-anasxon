from bson import ObjectId
from typing import Literal, List

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import FastAPI, HTTPException, Response, APIRouter, Depends, Body, Cookie

from app.database.models.user import Users
from app.database.models.request import SupportRequests
from app.database.models.componets import Components
from app.schemas.components import ComponentsRequest, ComponentsResponse, ComponentsUpdate
from app.schemas.request import SupportRequestCreate, SupportRequestWithUserCreate, SupportRequestEdited
from app.schemas.auth import UserRegister, UserLogin, UserOut
from app.schemas.user import UserRequest, UserUpdate
from app.core.auth import create_access_token, create_refresh_token, verify_token

app = FastAPI(
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

api = APIRouter(prefix="/api")


oauth2_scheme = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(auth: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    """Tokenni tekshiradi va hozirgi foydalanuvchini qaytaradi."""
    payload = verify_token(auth.credentials)
    if not payload:
        raise HTTPException(401, "Invalid token")
    print("---------------------------------------", payload.get('sub'))
    user = Users.get_by_id(payload.get('sub'))
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    return user


def manager_required(current_user=Depends(get_current_user)):
    """Foydalanuvchi manager bo‘lishi shart."""
    if current_user.get("role") != "manager":
        raise HTTPException(403, "Ruxsat yo'q")
    return current_user


def master_required(current_user=Depends(get_current_user)):
    """Foydalanuvchi master bo‘lishi shart."""
    if current_user.get("role") != "master":
        raise HTTPException(403, "Ruxsat yo'q")
    return current_user


def master_or_manager_required(current_user=Depends(get_current_user)):
    """Foydalanuvchi master bo‘lishi shart."""
    if current_user.get("role") not in ["master", "manager"]:
        raise HTTPException(403, "Ruxsat yo'q")
    return current_user


@api.post("/create_default_users", status_code=201)
def create_default_users():
    emails = ["manager@example.com", "master@example.com", "user@example.com"]
    for email in emails:
        if Users.get_by_email(email):
            raise HTTPException(409, f"User with email {email} already exists")

    manager_data = {
        "email": "manager@example.com",
        "first_name": "Manager",
        "last_name": "Admin",
        "password": "string",
        "role": "manager",
        "person_type": "individual"
    }
    manager_id, _ = Users.create(manager_data)

    master_data = {
        "email": "master@example.com",
        "first_name": "Master",
        "last_name": "User",
        "password": "string",
        "role": "master",
        "person_type": "individual"
    }
    master_id, _ = Users.create(master_data)

    user_data = {
        "email": "user@example.com",
        "first_name": "Normal",
        "last_name": "User",
        "password": "string",
        "role": "user",
        "person_type": "individual"
    }
    user_id, _ = Users.create(user_data)

    return {
        "manager_id": str(manager_id),
        "master_id": str(master_id),
        "user_id": str(user_id),
        "message": "Default users created successfully"
    }


@api.post("/register", summary="Ro'yxatdan o'tish")
def register(user: UserRegister, response: Response):
    if user.person_type == "legal" and not user.company_name:
        raise HTTPException(400, "Komapany nomini kiriting")
    if Users.get_by_email(user.email):
        raise HTTPException(400, "Bunday foydalanuvchi mavjud")
    data = user.model_dump()
    data["role"] = "user"
    user_id, _ = Users.create(data)
    payload = {"sub": str(user_id), "person_type": user.person_type}
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    response.set_cookie("refresh_token", refresh_token,
                        httponly=True, samesite="strict")
    return {"access_token": access_token, "token_type": "bearer"}


@api.post("/login", summary="Login qilish")
def login(user: UserLogin, response: Response):
    db_user = Users.get_by_email(user.email)
    if not db_user or not Users.verify_password(user.password, db_user["password"]):
        raise HTTPException(401, "Xato login yoki parol")
    payload = {"sub": str(db_user['_id']),
               "person_type": db_user.get("person_type")}
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    response.set_cookie("refresh_token", refresh_token,
                        httponly=True, samesite="strict")
    return {"access_token": access_token, "token_type": "bearer"}


@api.post("/refresh", summary="Access tokenni yangilash")
def refresh_token(refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(401, "Token yo'q")
    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(401, "Invalid refresh token")
    payload = {"sub": payload['sub'],
               "person_type": payload.get("person_type")}
    new_access_token = create_access_token(payload)
    return {"access_token": new_access_token, "token_type": "bearer"}


@api.get("/me",  summary="Hozirgi foydalanuvchi ma'lumotlari")
def me(current_user=Depends(get_current_user)):
    return current_user


@api.get("/users", dependencies=[Depends(manager_required)], summary="Foydalanuvchilar ro'yxati (manager uchun)")
def list_users():
    return Users.get_all()


@api.post("/users",  dependencies=[Depends(manager_required)], summary="Foydalanuvchi yaratish (manager uchun)")
def create_user(data_in: UserRequest):
    if Users.get_by_email(data_in.email):
        raise HTTPException(409, "Bunday foydalanuvchi mavjud")
    user_id, _ = Users.create(data_in.model_dump())
    return Users.get_by_id(str(user_id))


@api.patch("/user")
def update_user(data_in: UserUpdate, current_user=Depends(get_current_user)):
    existing_user = Users.get_by_id(current_user["_id"])
    if not existing_user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    if data_in.password:
        data_in.password = Users.hash_password(data_in.password)
    Users.update(current_user["_id"], data_in.model_dump(exclude_unset=True))
    return {"message": "User updated successfully"}


@api.patch("/users/{user_id}", dependencies=[Depends(manager_required)], summary="Foydalanuvchini tahrirlash (manager uchun)")
def update_user(user_id: str, data_in: UserUpdate):
    existing_user = Users.get_by_id(user_id)
    if not existing_user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    Users.update(user_id, data_in.model_dump(exclude_unset=True))
    return {"message": "User updated successfully"}


@api.delete("/users/{user_id}", dependencies=[Depends(manager_required)], summary="Foydalanuvchini o'chirish (manager uchun)")
def delete_user(user_id: str):
    existing_user = Users.get_by_id(user_id)
    if not existing_user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    Users.delete(user_id)
    return {"message": "User deleted successfully"}


@api.post("/support_request", summary="Support request yaratish")
def create_request(request: SupportRequestCreate, current_user=Depends(get_current_user)):
    data = request.model_dump()
    owner_id = current_user["_id"]
    data["owner_id"] = ObjectId(owner_id)
    return SupportRequests.create(data)


@api.post("/support_request_with_user", summary="Support request va user yaratish birga")
def create_request_with_user(data_in: SupportRequestWithUserCreate):
    request_data = data_in.request.model_dump()
    user_data = data_in.user.model_dump()

    if Users.get_by_email(user_data['email']):
        raise HTTPException(409, "Bunday foydalanuvchi mavjud")

    full_name = user_data.pop('full_name', '')
    parts = full_name.split(' ', 1)
    user_data['first_name'] = parts[0]
    user_data['last_name'] = parts[1] if len(parts) > 1 else ''

    user_id, random_password = Users.create(user_data)
    request_data["owner_id"] = ObjectId(user_id)
    SupportRequests.create(request_data)
    return {"user_id": str(user_id), "password": random_password}


@api.get("/support_request", summary="Support requestlarni ro'yxatini olish")
def list_requests(current_user=Depends(get_current_user)):
    if current_user["role"] == "manager":
        filter = {}
    elif current_user["role"] == "user":
        filter = {"owner_id": ObjectId(current_user["_id"])}
    elif current_user["role"] == "master":
        filter = {"master_id": ObjectId(current_user["_id"])}
    else:
        raise HTTPException(403, "Ruxsat yo'q")
    requests = SupportRequests.list(filter)
    requests
    return requests


@api.put("/support_request/status/{request_id}", summary="Support request statusini yangilash")
def update_support_status(request_id: str, status: Literal['checked', 'approved', 'in_progress', 'rejected', 'completed'] = Body(...)):
    return SupportRequests.update(request_id, {"status": status})


@api.post("/support_request/send_master/{request_id}", summary="Support requestga master tayinlash (manager uchun)")
def send_support_master(request_id: str, current_user=Depends(get_current_user)):
    if current_user["role"] != "manager":
        raise HTTPException(403, "Ruxsat yo'q")
    master = Users.get({"role": "master"})
    if not master:
        raise HTTPException(404, "Master topilmadi")
    SupportRequests.update(
        request_id, {"master_id": master["_id"], "status": "checked"})
    return {"message": "Master assigned successfully"}


@api.patch("/support_request/master/{request_id}", summary="Support requestni master tomonidan yangilash")
def update_support_master(request_id: str, data_in: SupportRequestEdited, current_user=Depends(get_current_user)):
    if current_user["role"] != "master":
        raise HTTPException(403, "Ruxsat yo'q")
    db_component = Components.get_by_id(data_in.component_id)
    if not db_component:
        raise HTTPException(404, "Extiyot qism topilmadi")
    if db_component["in_stock"] < data_in.quantity:
        raise HTTPException(400, "Extiyot qism yetarli emas")
    remaining_quantity = db_component["in_stock"] - data_in.quantity
    Components.update(data_in.component_id, {"in_stock": remaining_quantity})
    return SupportRequests.update(request_id, {
        "end_date": data_in.end_date,
        "price": data_in.price,
        "status": "approved"
    })


@api.post("/components", dependencies=[Depends(master_or_manager_required)], summary="Component yaratish (manager uchun)")
def create_component(data_in: ComponentsRequest):
    return Components.create(data_in.model_dump())


@api.get("/components/{component_id}", dependencies=[Depends(master_or_manager_required)], summary="Componentni olish (master uchun)")
def get_component(component_id: str):
    component = Components.get_by_id(component_id)
    if not component:
        raise HTTPException(404, "Extiyot qism topilmadi")
    return component


@api.get("/components", dependencies=[Depends(master_or_manager_required)], summary="Componentlar ro'yxati (master uchun)")
def list_components():
    return Components.list()


@api.patch("/components/{component_id}", dependencies=[Depends(master_or_manager_required)], summary="Componentni yangilash (manager uchun)")
def update_component(component_id: str, data_in: ComponentsUpdate):
    return Components.update(component_id, data_in.model_dump())


@api.delete("/components/{component_id}", dependencies=[Depends(master_or_manager_required)], summary="Componentni o'chirish (manager uchun)")
def delete_component(component_id: str):
    Components.delete(component_id)
    return {"message": "Extiyot qism o'chirildi"}


app.include_router(api)

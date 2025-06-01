from typing import Optional
from pydantic import BaseModel


class ComponentsRequest(BaseModel):
    title: str
    description: str
    price: float
    in_stock: int


class ComponentsResponse(BaseModel):
    _id: str
    title: str
    description: str
    price: float
    in_stock: int


class ComponentsUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    in_stock: Optional[int] = None
    
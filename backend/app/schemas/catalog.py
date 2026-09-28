from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel


class SiteRead(BaseModel):
    id: UUID
    institution_name: str
    name: str
    category: str
    district_ubigeo: str | None
    district_name: str | None
    address: str | None
    description: str | None
    longitude: float
    latitude: float
    verification_status: Literal['pending', 'verified']
    verified_at: datetime | None
    is_demo: bool


class SitePage(BaseModel):
    items: list[SiteRead]
    total: int
    limit: int
    offset: int


class DistrictRead(BaseModel):
    ubigeo: str
    name: str

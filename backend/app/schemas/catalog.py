from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


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
    distance_m: float | None = None
    is_demo: bool


class SitePage(BaseModel):
    items: list[SiteRead]
    total: int
    limit: int
    offset: int


class DistrictRead(BaseModel):
    ubigeo: str
    name: str


class SpatialSearch(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False, extra='forbid')
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    radius_m: float = Field(ge=100, le=20000)
    q: str | None = Field(default=None, max_length=150)
    district: str | None = Field(default=None, pattern=r'^\d{6}$')
    category: str | None = Field(default=None, max_length=80)
    limit: int = Field(default=12, ge=1, le=100)
    offset: int = Field(default=0, ge=0, le=100000)

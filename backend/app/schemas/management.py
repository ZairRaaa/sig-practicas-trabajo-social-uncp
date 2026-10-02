from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ExperienceCreate(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    student_id: UUID
    site_id: UUID
    period: str = Field(min_length=1, max_length=40)
    reference: str = Field(min_length=1, max_length=250)


class ExperienceState(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    enabled: bool = Field(strict=True)
    expected_enabled: bool = Field(strict=True)
    reference: str = Field(min_length=1, max_length=250)

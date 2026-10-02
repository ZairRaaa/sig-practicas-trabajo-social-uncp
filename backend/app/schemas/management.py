from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.services.experiences import normalize_period


class ExperienceCreate(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    student_id: UUID
    site_id: UUID
    period: str = Field(min_length=1, max_length=40)
    reference: str = Field(min_length=1, max_length=250)

    @field_validator('period', mode='before')
    @classmethod
    def canonical_period(cls, value: object) -> object:
        return normalize_period(value) if isinstance(value, str) else value


class ExperienceState(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    enabled: bool = Field(strict=True)
    expected_enabled: bool = Field(strict=True)
    reference: str = Field(min_length=1, max_length=250)

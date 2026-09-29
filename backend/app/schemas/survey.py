from typing import Annotated, Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

Score = Annotated[int, Field(strict=True, ge=1, le=5)]


class SubmissionInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    version: str = Field(max_length=40)
    kind: Literal['priorities', 'experience']
    experience_id: UUID | None = None
    consent: Literal[True]
    answers: dict[str, Score | None] = Field(min_length=5, max_length=5)

    @model_validator(mode='after')
    def matching_target(self):
        if (self.kind == 'experience') != (self.experience_id is not None):
            raise ValueError('La experiencia debe indicarse únicamente en el bloque de experiencia.')
        return self

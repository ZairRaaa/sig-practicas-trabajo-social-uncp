from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Experience(Base):
    __tablename__ = 'experiences'
    __table_args__ = (UniqueConstraint('user_id', 'site_id', 'period', name='uq_experience_assignment'),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='RESTRICT'), index=True)
    site_id: Mapped[UUID] = mapped_column(ForeignKey('sites.id', ondelete='RESTRICT'))
    period: Mapped[str] = mapped_column(String(40))
    authorization_reference: Mapped[str] = mapped_column(String(250))
    enabled: Mapped[bool] = mapped_column(Boolean, server_default='true')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SurveySubmission(Base):
    __tablename__ = 'survey_submissions'
    __table_args__ = (
        UniqueConstraint('user_id', 'version', 'kind', 'target_key', name='uq_survey_submission'),
        CheckConstraint("(kind = 'priorities' AND experience_id IS NULL AND target_key = 'priorities') OR "
                        "(kind = 'experience' AND experience_id IS NOT NULL AND target_key = experience_id::text)",
                        name='survey_target'),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id', ondelete='RESTRICT'), index=True)
    experience_id: Mapped[UUID | None] = mapped_column(ForeignKey('experiences.id', ondelete='RESTRICT'))
    version: Mapped[str] = mapped_column(String(40))
    kind: Mapped[str] = mapped_column(String(20))
    target_key: Mapped[str] = mapped_column(String(40))
    answers: Mapped[dict] = mapped_column(JSONB)
    instrument_snapshot: Mapped[dict] = mapped_column(JSONB)
    is_pilot: Mapped[bool] = mapped_column(Boolean, server_default='true')
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

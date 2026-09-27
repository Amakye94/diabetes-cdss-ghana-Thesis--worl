from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="NURSE")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    assessments = relationship(
        "ClinicalAssessment",
        back_populates="assessor"
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="user"
    )


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    sex: Mapped[str] = mapped_column(String(20), nullable=False)
    telephone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    assessments = relationship(
        "ClinicalAssessment",
        back_populates="patient",
        cascade="all, delete-orphan",
    )


class ClinicalAssessment(Base):
    __tablename__ = "clinical_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    assessed_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    assessment_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    age_years: Mapped[float] = mapped_column(Float, nullable=False)
    height_cm: Mapped[float] = mapped_column(Float, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    bmi_kg_m2: Mapped[float] = mapped_column(Float, nullable=False)
    waist_cm: Mapped[float] = mapped_column(Float, nullable=False)

    mean_systolic_bp_mmhg: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    mean_diastolic_bp_mmhg: Mapped[float] = mapped_column(
        Float, nullable=False
    )

    current_smoking: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    alcohol_past_12_months: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    fruit_servings_per_day: Mapped[float] = mapped_column(
        Float, nullable=False
    )
    vegetable_servings_per_day: Mapped[float] = mapped_column(
        Float, nullable=False
    )

    vigorous_work_activity: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    moderate_work_activity: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    active_transport: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    vigorous_leisure_activity: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    moderate_leisure_activity: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    patient = relationship(
        "Patient",
        back_populates="assessments"
    )

    assessor = relationship(
        "User",
        back_populates="assessments"
    )

    prediction = relationship(
        "Prediction",
        back_populates="assessment",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    assessment_id: Mapped[int] = mapped_column(
        ForeignKey("clinical_assessments.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    prediction_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    classification: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    threshold: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.50,
    )

    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    assessment = relationship(
        "ClinicalAssessment",
        back_populates="prediction"
    )

    explanations = relationship(
        "PredictionExplanation",
        back_populates="prediction",
        cascade="all, delete-orphan",
    )


class PredictionExplanation(Base):
    __tablename__ = "prediction_explanations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    prediction_id: Mapped[int] = mapped_column(
        ForeignKey("predictions.id"),
        nullable=False,
        index=True,
    )

    feature: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    feature_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    shap_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    direction: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    prediction = relationship(
        "Prediction",
        back_populates="explanations"
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    resource_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    resource_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
        back_populates="audit_logs"
    )
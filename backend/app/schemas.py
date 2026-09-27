from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# =========================================================
# PATIENT SCHEMAS
# =========================================================

class PatientBase(BaseModel):
    patient_number: str
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    sex: str
    telephone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    telephone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# AUTHENTICATION SCHEMAS
# =========================================================

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "NURSE"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# =========================================================
# CLINICAL ASSESSMENT SCHEMAS
# =========================================================

class ClinicalAssessmentCreate(BaseModel):
    patient_id: int

    age_years: float
    height_cm: float
    weight_kg: float
    waist_cm: float

    mean_systolic_bp_mmhg: float
    mean_diastolic_bp_mmhg: float

    current_smoking: int
    alcohol_past_12_months: int

    fruit_servings_per_day: float
    vegetable_servings_per_day: float

    vigorous_work_activity: int
    moderate_work_activity: int
    active_transport: int
    vigorous_leisure_activity: int
    moderate_leisure_activity: int


class ClinicalAssessmentResponse(BaseModel):
    id: int
    patient_id: int
    assessed_by: int

    age_years: float
    height_cm: float
    weight_kg: float
    bmi_kg_m2: float
    waist_cm: float

    mean_systolic_bp_mmhg: float
    mean_diastolic_bp_mmhg: float

    current_smoking: int
    alcohol_past_12_months: int

    fruit_servings_per_day: float
    vegetable_servings_per_day: float

    vigorous_work_activity: int
    moderate_work_activity: int
    active_transport: int
    vigorous_leisure_activity: int
    moderate_leisure_activity: int

    model_config = ConfigDict(from_attributes=True)
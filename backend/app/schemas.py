from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PlanItem(BaseModel):
    pose_id: str
    hold_seconds: int = 20
    sets: int = 1
    days: List[str] = Field(default_factory=lambda: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
    tip: str = ""


class PlanResponse(BaseModel):
    needs_doctor: bool = False
    summary: str = ""
    plan: List[PlanItem] = Field(default_factory=list)
    total_minutes: int = 15
    not_covered: List[str] = Field(default_factory=list)
    disclaimer: str = "Yeh doctor ki salah nahi hai. Dard ho to rukein."


class PlanRequest(BaseModel):
    goal_or_concern: str
    minutes_available: int = 15
    age_group: str = "adult"  # "adult", "senior", "child"


class DoctorDraftRequest(BaseModel):
    goal_or_concern: Optional[str] = ""
    minutes_available: int = 15
    age_group: str = "adult"


class AssignRequest(BaseModel):
    patient_identifier: str
    patient_name: Optional[str] = None
    plan: Dict[str, Any]
    weeks: int = 2
    start_date: Optional[str] = None


class SessionLogRequest(BaseModel):
    patient_identifier: str
    assignment_id: Optional[int] = None
    date: str  # YYYY-MM-DD
    pose_id: str
    status: str  # 'done' | 'skipped' | 'pain'
    best_angle: Optional[float] = None
    hold_seconds: int = 0
    note: Optional[str] = None
    source: str = "self"  # 'doctor' | 'self'


class SummaryRequest(BaseModel):
    patient_identifier: str
    days: int = 14


class ErrorDetail(BaseModel):
    code: str
    message: str


class StandardError(BaseModel):
    error: ErrorDetail

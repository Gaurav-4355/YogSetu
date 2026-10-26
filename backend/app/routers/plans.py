from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List, Dict, Any
from ..services.plan_service import load_poses
from ..services.gemma_service import generate_plan_from_text, generate_plan_from_image
from ..schemas import PlanRequest, PlanResponse, DoctorDraftRequest

router = APIRouter(prefix="/api", tags=["plans"])


@router.get("/poses", response_model=List[Dict[str, Any]])
def get_poses():
    return load_poses()


@router.post("/plan/self", response_model=PlanResponse)
def create_self_plan(req: PlanRequest):
    return generate_plan_from_text(
        goal_or_concern=req.goal_or_concern,
        minutes_available=req.minutes_available,
        age_group=req.age_group
    )


@router.post("/plan/from-note", response_model=PlanResponse)
async def create_plan_from_note(
    note_image: UploadFile = File(...),
    minutes_available: int = Form(15),
    age_group: str = Form("adult")
):
    if not note_image.content_type or not note_image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_FILE_TYPE", "message": "Only image files (JPEG, PNG, WEBP) are supported."}}
        )

    content = await note_image.read()
    if len(content) > 6 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "FILE_TOO_LARGE", "message": "Image size exceeds 6MB limit."}}
        )

    return generate_plan_from_image(
        image_bytes=content,
        mime_type=note_image.content_type,
        minutes_available=minutes_available,
        age_group=age_group
    )


@router.post("/doctor/plan-draft", response_model=PlanResponse)
async def create_doctor_draft(
    goal_or_concern: Optional[str] = Form(""),
    minutes_available: int = Form(15),
    age_group: str = Form("adult"),
    note_image: Optional[UploadFile] = File(None)
):
    if note_image and note_image.filename:
        if not note_image.content_type or not note_image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail={"error": {"code": "INVALID_FILE_TYPE", "message": "Only image files are accepted."}}
            )
        content = await note_image.read()
        return generate_plan_from_image(
            image_bytes=content,
            mime_type=note_image.content_type,
            minutes_available=minutes_available,
            age_group=age_group
        )

    return generate_plan_from_text(
        goal_or_concern=goal_or_concern or "Spine mobility and posture routine",
        minutes_available=minutes_available,
        age_group=age_group
    )

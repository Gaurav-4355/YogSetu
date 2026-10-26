from typing import Optional
from fastapi import Header, Depends
from sqlalchemy.orm import Session
from .db import get_db
from .services.identity import normalize_identifier


def get_current_demo_user(
    x_demo_identity: Optional[str] = Header(None, alias="X-Demo-Identity"),
    x_demo_role: Optional[str] = Header(None, alias="X-Demo-Role")
):
    if not x_demo_identity:
        return {"identifier": None, "id_type": None, "role": x_demo_role or "user"}
    norm_id, id_type = normalize_identifier(x_demo_identity)
    return {
        "identifier": norm_id,
        "id_type": id_type,
        "role": (x_demo_role or "user").lower()
    }

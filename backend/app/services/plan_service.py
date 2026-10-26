import json
from pathlib import Path
from typing import List, Dict, Any
from ..schemas import PlanResponse, PlanItem

POSES_FILE = Path(__file__).parent.parent / "data" / "poses.json"


def load_poses() -> List[Dict[str, Any]]:
    with open(POSES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


VALID_POSES = load_poses()
VALID_POSE_IDS = {p["id"] for p in VALID_POSES}


def generate_fallback_plan(
    goal_or_concern: str,
    minutes_available: int = 15,
    age_group: str = "adult",
    not_covered: List[str] = None
) -> PlanResponse:
    """
    Intelligent rule-based fallback generator for DEMO_MODE or when API key is unset.
    Always uses valid poses from poses.json.
    """
    lower_goal = (goal_or_concern or "").lower()
    items: List[PlanItem] = []

    # Customize pose selection based on concern keywords
    if any(k in lower_goal for k in ["back", "peeth", "kamar", "spine", "sitting"]):
        selected_ids = ["marjaryasana_bitilasana", "bhujangasana", "setu_bandhasana", "balasana"]
    elif any(k in lower_goal for k in ["balance", "leg", "pair", "focus", "standing"]):
        selected_ids = ["tadasana", "vrikshasana", "vajrasana"]
    elif any(k in lower_goal for k in ["neck", "gardan", "shoulder", "kandha", "desk"]):
        selected_ids = ["neck_rolls", "tadasana", "marjaryasana_bitilasana", "balasana"]
    elif any(k in lower_goal for k in ["hip", "flexibility", "stiff", "stretch"]):
        selected_ids = ["baddha_konasana", "ardha_matsyendrasana", "balasana"]
    else:
        # Balanced general morning routine
        selected_ids = ["tadasana", "vrikshasana", "marjaryasana_bitilasana", "balasana"]

    is_child = age_group == "child"
    is_senior = age_group == "senior"

    for pid in selected_ids:
        hold = 12 if is_child else (20 if is_senior else 25)
        sets = 1 if is_child else 2

        if pid == "tadasana":
            base_tip = "Reeda seedhi rakhein aur dono pairo par samaan vajan rakhein."
        elif pid == "vrikshasana":
            base_tip = "Ek bindu par dhyan lagayein, deewar ka sahara le sakte hain."
        elif pid == "marjaryasana_bitilasana":
            base_tip = "Dheere saans lete hue peeth ko aaram se stretch karein."
        else:
            base_tip = "Gentle stretching, saans par dhyan dein."

        tip = f"{base_tip} (Do with a parent present.)" if is_child else base_tip

        items.append(PlanItem(
            pose_id=pid,
            hold_seconds=hold,
            sets=sets,
            days=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            tip=tip
        ))

    summary = (
        f"Aapke lakshya ke anusaar {len(items)} aasan chune gaye hain jo daily flexibility "
        f"aur body stiffness kam karne mein madadgar ho sakte hain."
    )

    return PlanResponse(
        needs_doctor=False,
        summary=summary,
        plan=items,
        total_minutes=min(minutes_available, max(10, len(items) * 3)),
        not_covered=not_covered or [],
        disclaimer="Yeh doctor ki salah nahi hai. Dard ho to rukein."
    )

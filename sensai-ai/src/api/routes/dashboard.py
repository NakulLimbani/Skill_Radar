# sensai-ai/src/api/routes/dashboard.py

from fastapi import APIRouter, HTTPException
from api.services import data_processor

router = APIRouter()

@router.get("/candidates")
async def get_all_candidates():
    """Returns a list of all candidates for the dashboard overview."""
    data = data_processor.get_processed_candidate_data()
    # Return a simplified list of candidates for the initial view
    return [{"id": candidate_id, "name": candidate["name"]} for candidate_id, candidate in data.items()]

@router.get("/candidates/{candidate_id}/skills")
async def get_candidate_skills(candidate_id: str):
    """Returns skill scores for a specific candidate to draw the radar chart."""
    candidate_data = data_processor.get_candidate_details(candidate_id)
    if not candidate_data:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Return scores in a format suitable for a radar chart
    return {
        "name": candidate_data["name"],
        "scores": [
            {"skill": skill, "score": score["score"]}
            for skill, score in candidate_data["scores"].items()
        ]
    }

@router.get("/candidates/{candidate_id}/skills/{skill_name}/details")
async def get_skill_details(candidate_id: str, skill_name: str):
    """Returns detailed evidence for a specific skill."""
    skill_data = data_processor.get_skill_details(candidate_id, skill_name)
    if not skill_data:
        raise HTTPException(status_code=404, detail="Skill details not found")
    return skill_data

# You'll also need a route to handle PDF generation
# For now, let's just create a placeholder
@router.get("/candidates/{candidate_id}/export")
async def export_candidate_pdf(candidate_id: str):
    return {"message": f"PDF export for {candidate_id} is not yet implemented."}
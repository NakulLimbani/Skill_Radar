from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from ..models import SkillRadarResponse

def build_skill_radar(user_id: int, db: Session) -> SkillRadarResponse:
    query = text("""
        SELECT q.type AS skill, AVG(qs.score) AS score
        FROM question_scorecards qs
        JOIN questions q ON qs.question_id = q.id
        JOIN task_completions tc ON tc.question_id = q.id
        WHERE tc.user_id = :user_id
        GROUP BY q.type
    """)

    result = db.execute(query, {'user_id': user_id}).fetchall()

    # Convert list of tuples to dict: {skill: score}
    scores = {row[0]: row[1] for row in result}

    return SkillRadarResponse(user_id=user_id, scores=scores)

# sensai-ai/src/api/services/data_processor.py

import pandas as pd
import os

def get_processed_candidate_data():
    # Placeholder for the data processing logic
    # In a real scenario, you would read from the 200 files
    
    # For now, let's return some mock data to get started
    return {
        "candidate_1": {
            "name": "Alice Johnson",
            "scores": {
                "Algorithms": {"score": 8.5, "evidence": "Solved the 'Knapsack Problem' with a dynamic programming approach. Code: [LINK TO REPO]", "trend": "Improved from score 6.0 in first attempt."},
                "SQL": {"score": 7.8, "evidence": "Optimized a N-1 JOIN query by adding an index. View replay: [LINK TO REPLAY]", "trend": "Score has been consistent across two attempts."},
                "System Design": {"score": 6.5, "evidence": "Provided a scalable architecture for a video streaming service. Missed some details on caching strategy.", "trend": "N/A - Only one attempt."},
                "Debugging": {"score": 9.2, "evidence": "Fixed a deadlock issue in a multithreaded application in under 5 minutes. See git commit: [LINK]", "trend": "Perfect score on both attempts."},
            },
        },
        "candidate_2": {
            "name": "Bob Williams",
            "scores": {
                "Algorithms": {"score": 7.1, "evidence": "...", "trend": "..."},
                "SQL": {"score": 9.1, "evidence": "...", "trend": "..."},
                "System Design": {"score": 8.0, "evidence": "...", "trend": "..."},
                "Debugging": {"score": 7.5, "evidence": "...", "trend": "..."},
            },
        },
    }

def get_candidate_details(candidate_id: str):
    data = get_processed_candidate_data()
    return data.get(candidate_id)

def get_skill_details(candidate_id: str, skill_name: str):
    data = get_processed_candidate_data()
    candidate_data = data.get(candidate_id)
    if candidate_data:
        return candidate_data["scores"].get(skill_name)
    return None
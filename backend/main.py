from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility to load profiles.json
def load_profiles():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, "profiles.json")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

# Get total count (optional, useful for UI)
@app.get("/api/profiles/count")
def count_profiles():
    profiles = load_profiles()
    return {"count": len(profiles)}

# Get single profile by index (zero based)
@app.get("/api/profiles/{idx}")
def get_profile_by_idx(idx: int):
    profiles = load_profiles()
    if idx < 0 or idx >= len(profiles):
        return JSONResponse(content={"detail": "No more profiles"}, status_code=404)
    return JSONResponse(content=profiles[idx])

# Optionally, get by id
@app.get("/api/profiles/id/{profile_id}")
def get_profile_by_id(profile_id: int):
    profiles = load_profiles()
    for profile in profiles:
        if profile.get("id") == profile_id:
            return JSONResponse(content=profile)
    return JSONResponse(content={"detail": "Profile not found"}, status_code=404)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import json
import traceback
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and tokenizer
model = None
tokenizer = None

def get_model():
    global model, tokenizer
    if model is None:
        print("Loading Llama model...")
        model_id = "meta-llama/Llama-3.1-8B-Instruct"
        tokenizer = AutoTokenizer.from_pretrained(model_id)
        # Set pad_token if not set
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            dtype=torch.float16,
            device_map="auto",
        )
        print("Model loaded successfully!")
    return model, tokenizer

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

# AI Judgment endpoint
@app.get("/api/judge/{idx}")
def judge_profile(idx: int):
    profiles = load_profiles()
    if idx < 0 or idx >= len(profiles):
        return JSONResponse(content={"detail": "Profile not found"}, status_code=404)
    
    profile = profiles[idx]
    
    # Build profile description for AI
    profile_text = f"Name: {profile.get('name', 'Unknown')}\n"
    profile_text += f"Gender: {profile.get('details', '').split()[1] if len(profile.get('details', '').split()) > 1 else 'Unknown'}\n"
    profile_text += f"Details: {profile.get('details', '')}\n\n"
    profile_text += "Profile elements:\n"
    
    for el in profile.get('elements', []):
        if el.get('type') == 'text':
            profile_text += f"- {el.get('title', '')}: {el.get('subtitle', '')}\n"
        elif el.get('type') == 'image':
            profile_text += f"- Image: {el.get('title', '')} {el.get('subtitle', '')}\n"
    
    # Create judgment prompt
    prompt = f"""You are a dating profile evaluator. Your job is to judge whether a dating profile is interesting and worth swiping right on.

IMPORTANT CRITERIA:
- Don't judge primarily on looks or physical appearance
- Focus on personality, interests, and what makes them unique
- Look for genuine depth and authenticity in their responses
- Check if their personality revolves around just one thing (like gym) - that's boring
- See if their interests are diverse and engaging
- Evaluate if they seem like a good, interesting person
- Consider their gender and evaluate appropriately
- Check if they have substance beyond surface-level traits

Profile to evaluate:
{profile_text}

Based on this profile, respond with ONLY ONE of these exact phrases:
- "SWIPE RIGHT" if the profile is interesting and worth matching with
- "SWIPE LEFT" if the profile is boring or uninteresting

Then on a new line, provide a brief reason (1-2 sentences) for your decision.

Your response:"""

    # Get AI judgment
    try:
        model, tokenizer = get_model()
        
        # Simpler approach: direct tokenization
        input_ids = tokenizer(
            prompt,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=2048
        ).input_ids.to(model.device)
        
        outputs = model.generate(
            input_ids,
            max_new_tokens=150,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id
        )
        
        response = tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)
        
        # Parse response
        lines = response.strip().split('\n')
        decision = "SWIPE RIGHT" if "SWIPE RIGHT" in lines[0].upper() else "SWIPE LEFT"
        reason = lines[1] if len(lines) > 1 else lines[0]
        
        return JSONResponse(content={
            "decision": decision,
            "reason": reason.strip(),
            "profile_id": profile.get('id')
        })
        
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"Error in AI judgment: {str(e)}")
        print(f"Full traceback:\n{error_traceback}")
        return JSONResponse(
            content={"detail": f"Error generating judgment: {str(e)}"}, 
            status_code=500
        )
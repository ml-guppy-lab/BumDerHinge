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
    # json_path = os.path.join(base_dir, "profiles.json")  # Old test profiles
    json_path = os.path.join(base_dir, "profile_friends.json")  # Friends profiles
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
        if el.get('title') == 'Timestamp':
            continue  # Skip timestamp
        if el.get('type') == 'text':
            subtitle = el.get('subtitle', '').strip()
            if subtitle:  # Only add if not empty
                profile_text += f"- {el.get('title', '')}: {subtitle}\n"
        elif el.get('type') == 'image':
            title = el.get('title', '').strip()
            subtitle = el.get('subtitle', '').strip()
            if title or subtitle:
                profile_text += f"- Image: {title} {subtitle}\n"
    
    # Create judgment prompt
    prompt = f"""You are a sassy, witty dating profile judge. Be brutally honest but funny.

IMPORTANT CRITERIA:
- Don't judge on looks - focus on personality and interests
- Red flags: 
  * One-dimensional personality (gym bro, only work, only one hobby)
  * Boring/generic answers that could apply to anyone
  * Too romantic/desperate (hopeless romantic, overly clingy vibes)
  * Extremely high or unrealistic expectations
  * Morally questionable values or red flag behavior
  * Vague or empty responses that say nothing meaningful
  * Trying too hard to be funny/quirky but failing
  * Only talking about themselves without showing interest in others
  * Lack of self-awareness or humility (sky-high standards but no self-reflection)
  * Overuse of cliches or buzzwords without substance (e.g. "I love to travel and try new foods" with no specifics)
  * Extremely generic or basic interests (e.g. "I like movies and music" with no further detail)
  * Extremely one-track mind (e.g. only talking about work, gym, or one hobby with no other interests)
  * Extremely high romance expectations (e.g. "I want a soulmate who will love me forever and never argue" or "I want a relationship straight out of a Nicholas Sparks novel")
  * Extremely high standards without self-awareness (e.g. "I want someone who is perfect in every way" with no acknowledgment of their own flaws)
  * Too judgemental or overly demanding of potential matches, with harsh requirements that show lack of flexibility or openness
- Green flags: 
  * Diverse interests showing depth
  * Genuine personality and authenticity
  * Good sense of humor
  * Unique traits and thoughtful answers
  * Healthy relationship expectations
  * Good moral compass and values
- Consider their gender appropriately

BE CRITICAL - Most people should get SWIPE LEFT. Only truly interesting, well-rounded people with genuine depth deserve SWIPE RIGHT.

Profile to evaluate:
{profile_text}

Respond with:
Line 1: ONLY "SWIPE RIGHT" or "SWIPE LEFT"
Line 2: A SHORT, HILARIOUS reason (max 10 words). Be EXTREMELY quirky, sarcastic, and playful BUT sugarcoat it - don't be too direct or harsh. Make it funny and cheeky, not brutally honest. Use emojis.

Examples of good reasons:
- "Gym = entire personality 🏋️😴"
- "Actually interesting! Rare find ✨"
- "Basic as pumpkin spice latte 🎃"
- "Would vibe with this human 🤝"
- "Too romantic = red flag alert 🚩"
- "Sky-high expectations, zero self-awareness 🎈"
- "One-track mind spotted 🎵 needs more playlists"
- "Personality depth: kiddie pool 🏊 vibes"
- "Romance level: Nicholas Sparks fanfic energy 📚✨"
- "Expectations higher than my wifi bill 📡💸"
- "Refreshingly interesting! A whole mood ✨🎭"
- "Vibe check passed with flying colors 🌈"

Your response:"""

    # Get AI judgment
    try:
        model, tokenizer = get_model()
        
        # Tokenize with attention mask
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=2048
        )
        input_ids = inputs['input_ids'].to(model.device)
        attention_mask = inputs['attention_mask'].to(model.device)
        
        # Try sampling first, fallback to greedy if it fails
        try:
            outputs = model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,
                max_new_tokens=150,
                temperature=0.7,
                top_p=0.9,
                min_p=0.05,  # Prevent sampling from very low probability tokens
                do_sample=True,
                pad_token_id=tokenizer.pad_token_id
            )
        except RuntimeError as gen_error:
            if "probability tensor" in str(gen_error):
                print(f"Sampling failed for profile {idx}, falling back to greedy decoding")
                # Fallback to greedy decoding
                outputs = model.generate(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    max_new_tokens=150,
                    do_sample=False,
                    pad_token_id=tokenizer.pad_token_id
                )
            else:
                raise
        
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
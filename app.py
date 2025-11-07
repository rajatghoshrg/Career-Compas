from flask import Flask, render_template, request, jsonify
import json
import google.generativeai as genai
import os
import random

# -----------------------------------------
# CONFIGURATION
# -----------------------------------------
app = Flask(__name__)

# Paste your Gemini API key directly here (no .env)
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
genai.configure(api_key=GEMINI_API_KEY)

# Choose a model you have access to; adjust if needed
try:
    model = genai.GenerativeModel("gemini-1.5-flash")
except Exception:
    # fallback name if environment / SDK differs
    model = None

# Base data directory (all JSON files expected here)
DATA_DIR = os.path.join("static", "data")


# -----------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------
def data_path(filename: str) -> str:
    """Return the full path for a data file inside static/data/"""
    return os.path.join(DATA_DIR, filename)


def load_json(filename: str):
    """Load data from a JSON file inside static/data/"""
    path = data_path(filename)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(filename: str, data):
    """Save data to a JSON file inside static/data/"""
    path = data_path(filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


# -----------------------------------------
# ROUTES
# -----------------------------------------
@app.route("/")
def home():
    quotes = load_json("quotes.json") or []
    random_quote = random.choice(quotes) if quotes else {"text": "", "author": ""}
    return render_template("index.html", quote=random_quote)


@app.route("/quiz")
def quiz():
    quiz_data = load_json("quiz_data.json") or {"questions": []}
    return render_template("quiz.html", quiz_data=quiz_data)


@app.route("/result", methods=["POST"])
def result():
    """
    Expecting form data (from the quiz). The quiz template here uses
    input names like '0', '1', '2'... mapping to quiz_data.questions indices.
    """
    answers = request.form.to_dict()
    quiz_data = load_json("quiz_data.json") or {"questions": []}

    # Basic validation
    if not answers:
        return "No answers received. Please complete the quiz.", 400

    # Simple scoring logic:
    # Each question entry in quiz_data.questions must include a 'category' field
    # and the option 'value' should be numeric so we can sum them.
    categories = {}
    total_score = 0
    for key, value in answers.items():
        try:
            q_index = int(key)
            q_obj = quiz_data["questions"][q_index]
            cat = q_obj.get("category", "General")
            # try convert value to int, fallback to 1
            score = int(value) if value is not None and str(value).isdigit() else 1
            categories[cat] = categories.get(cat, 0) + score
            total_score += score
        except Exception:
            # skip malformed keys
            continue

    if not categories:
        return "Couldn't compute results. Check quiz_data.json format.", 500

    best_match = max(categories, key=categories.get)
    match_percent = round((categories[best_match] / (total_score or 1)) * 100, 2)

    career_resources = load_json("career_resources.json") or {}
    # support two shapes: either resource stores 'roadmap' or separate career_roadmaps.json
    roadmap = []
    if best_match in career_resources and isinstance(career_resources[best_match], dict):
        roadmap = career_resources[best_match].get("roadmap", [])
        skills = career_resources[best_match].get("skills", [])
        desc = career_resources[best_match].get("description", "A great career choice!")
    else:
        # fallback to career_roadmaps.json + career_resources categories
        cr = load_json("career_roadmaps.json") or {}
        roadmap = cr.get(best_match, {}).get("stages", [])
        # for skills/desc try career_resources by category name
        skills = career_resources.get(best_match, {}).get("skills", [])
        desc = career_resources.get(best_match, {}).get("description", "A great career choice!")

    # Normalize roadmap: convert array of strings -> array of objects with stage/progress if needed
    normalized_roadmap = []
    if roadmap and isinstance(roadmap, list):
        # if list of dicts already with stage/progress, use as-is
        if isinstance(roadmap[0], dict) and "stage" in roadmap[0]:
            normalized_roadmap = roadmap
        else:
            # convert string array to objects and assign progressive % for visualization
            step_count = len(roadmap)
            for i, r in enumerate(roadmap):
                progress = round(((i + 1) / step_count) * 100)
                normalized_roadmap.append({"stage": r, "progress": progress})
    else:
        normalized_roadmap = []

    return render_template(
        "result.html",
        career=best_match,
        match_percent=match_percent,
        roadmap=normalized_roadmap,
        skills=skills,
        desc=desc
    )


@app.route("/chat")
def chat():
    return render_template("chat.html")


@app.route("/get_response", methods=["POST"])
def get_response():
    """Call Gemini to get a career-advice reply; fallback to keyword JSON on error."""
    body = request.get_json(force=True, silent=True) or {}
    user_msg = body.get("message", "").strip()
    if not user_msg:
        return jsonify({"reply": "Please send a message describing your interests or skills."})

    # Prepare a clear system prompt
    system_prompt = (
        "You are CareerBot, an expert career counselor for students and early professionals. "
        "Be concise, friendly and actionable. For the user's input, suggest 1-3 suitable career paths, "
        "list 3-5 concrete skills to learn, and provide 3 short steps to get started. "
        "If the user asks a clarification question, ask one short follow-up instead of a long paragraph."
    )

    # Try Gemini first
    try:
        if model is not None:
            # using the simple generate_content interface; adapt if your SDK requires different args
            prompt = f"{system_prompt}\nUser: {user_msg}\nCareerBot:"
            resp = model.generate_content(prompt)
            bot_reply = getattr(resp, "text", None) or str(resp)
            bot_reply = bot_reply.strip()
            if bot_reply:
                return jsonify({"reply": bot_reply})
    except Exception as e:
        # log server-side for debugging
        print("Gemini error:", e)

    # Fallback: keyword-based responses from career_chatbot.json
    fallback = load_json("career_chatbot.json") or {}
    lower = user_msg.lower()
    # try keyword sections
    # structure expected: { "interests": { "coding": "reply"... }, "skills": {...}, "general": {...} }
    for section in ("interests", "skills", "general"):
        sec = fallback.get(section, {})
        for kw, reply in sec.items():
            if kw in lower:
                return jsonify({"reply": reply})

    # final fallback message
    default_reply = (
        "I couldn't fetch a live answer right now. "
        "Try asking like: 'I enjoy coding and math — what career fits me?'"
    )
    return jsonify({"reply": default_reply})


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/resources")
def resources():
    data = load_json("career_resources.json") or {}
    return render_template("resources.html", data=data)


@app.route("/admin", methods=["GET", "POST"])
def admin():
    """
    Simple admin to update JSON files inside static/data/.
    The admin form should POST 'password', 'section' (filename without .json),
    and 'data' which is the JSON content as text.
    """
    if request.method == "POST":
        password = request.form.get("password", "")
        if password != "admin123":
            return "Invalid password!", 403

        section = request.form.get("section", "")
        new_data_text = request.form.get("data", "")

        if not section or not new_data_text:
            return "Missing section or data", 400

        filename = f"{section}.json"
        try:
            parsed = json.loads(new_data_text)
            save_json(filename, parsed)
            return f"✅ {filename} updated successfully!"
        except Exception as e:
            return f"❌ Error saving {filename}: {e}", 400

    return render_template("admin.html")


# -----------------------------------------
# RUN APP
# -----------------------------------------
if __name__ == "__main__":
    # Use 0.0.0.0 if you want to access from local network; otherwise default is fine.
    app.run(debug=True)

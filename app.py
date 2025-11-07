from flask import Flask, render_template, request, jsonify, redirect, url_for
import json, os
from functools import wraps

app = Flask(__name__)
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

# ------------------ Helper Functions ------------------
def load_json(fname):
    path = os.path.join(DATA_DIR, fname)
    if not os.path.exists(path):
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(fname, data):
    path = os.path.join(DATA_DIR, fname)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ------------------ Admin Auth ------------------
ADMIN_PASSWORD = 'admin123'

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        pw = request.args.get('pw') or request.form.get('pw')
        if pw != ADMIN_PASSWORD:
            return redirect(url_for('admin'))
        return f(*args, **kwargs)
    return decorated

# ------------------ Routes ------------------
@app.route('/')
def home():
    resources = load_json('career_resources.json')
    return render_template('index.html', resources=resources)

@app.route('/quiz')
def quiz():
    quiz_data = load_json('quiz_data.json')
    return render_template('quiz.html', quiz_data=quiz_data)

@app.route('/result', methods=['POST'])
def result():
    answers = request.form.to_dict()
    quiz_data = load_json('quiz_data.json')
    careers = {}

    for q in quiz_data.get('questions', []):
        qid = str(q['id'])
        choice = answers.get(qid)
        if not choice:
            continue
        weights = q['choices'].get(choice, {})
        for career, w in weights.items():
            careers[career] = careers.get(career, 0) + w

    if not careers:
        return redirect(url_for('quiz'))

    max_score = max(careers.values())
    total = sum(careers.values())
    career_entries = load_json('career_resources.json').get('careers', {})

    top_career = max(careers, key=careers.get)
    matching_pct = int((careers[top_career] / total) * 100) if total else 0

    career_info = career_entries.get(top_career, {
        'title': top_career,
        'description': 'No description yet.',
        'skills': [],
        'roadmap': []
    })

    return render_template('result.html', career=career_info, matching_pct=matching_pct)

@app.route('/chat')
def chat_page():
    return render_template('chat.html')

@app.route('/dashboard')
def dashboard():
    user_data = load_json('user_data.json')
    return render_template('dashboard.html', user_data=user_data)

@app.route('/get_response', methods=['POST'])
def get_response():
    payload = request.json or {}
    message = payload.get('message', '').lower()
    bot_data = load_json('career_chatbot.json')

    for intent in bot_data.get('intents', []):
        for pattern in intent.get('patterns', []):
            if pattern.lower() in message:
                return jsonify({'reply': intent.get('response')})

    return jsonify({'reply': bot_data.get('fallback', "Sorry, I’m not sure about that!")})

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    message = ''
    if request.method == 'POST':
        pw = request.form.get('pw')
        if pw != ADMIN_PASSWORD:
            message = 'Wrong password.'
        else:
            quiz_blob = request.form.get('quiz_blob')
            chat_blob = request.form.get('chat_blob')
            resources_blob = request.form.get('resources_blob')
            try:
                if quiz_blob: save_json('quiz_data.json', json.loads(quiz_blob))
                if chat_blob: save_json('career_chatbot.json', json.loads(chat_blob))
                if resources_blob: save_json('career_resources.json', json.loads(resources_blob))
                message = 'Saved successfully!'
            except Exception as e:
                message = f'Error: {e}'
    return render_template('admin.html', message=message)

if __name__ == '__main__':
    os.makedirs(DATA_DIR, exist_ok=True)
    app.run(debug=True)

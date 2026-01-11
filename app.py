#!/usr/bin/env python3
"""
Clean backend app for AI Translator
Features: Text translate, Voice translate, Keywords, Conversation, Practice
Image translation removed.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import traceback

from translation_service import TranslationService
from voice_service import VoiceService
from practice_service import PracticeService
from conversation_service import ConversationService

app = Flask(__name__)
CORS(app)

# Initialize services
translation_service = TranslationService()
voice_service = VoiceService()
practice_service = PracticeService()
conversation_service = ConversationService()


@app.route('/api/languages', methods=['GET'])
def get_languages():
    try:
        langs = translation_service.get_supported_languages()
        return jsonify({'success': True, 'languages': langs})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/translate', methods=['POST'])
def translate_text():
    try:
        data = request.get_json() or {}
        source_text = data.get('source_text') or data.get('text') or ''
        source_lang = data.get('source_lang', 'auto')
        target_lang = data.get('target_lang', 'en')

        if not source_text:
            return jsonify({'success': False, 'error': 'source_text is required'}), 400

        res = translation_service.translate(text=source_text, src_lang=source_lang, dest_lang=target_lang)
        return jsonify({'success': True, 'translated_text': res.get('translated_text'),
                        'source_language': res.get('source_language'), 'target_language': res.get('target_language')})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/voice/translate', methods=['POST'])
def voice_translate():
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'audio file is required'}), 400

        audio_file = request.files['audio']
        source_lang = request.form.get('source_lang', 'auto')
        target_lang = request.form.get('target_lang', 'en')

        # Convert speech to text
        speech_res = voice_service.speech_to_text(audio_file, language=source_lang)
        user_text = speech_res.get('text') if isinstance(speech_res, dict) else ''

        # Translate
        trans = translation_service.translate(text=user_text or '', src_lang=source_lang, dest_lang=target_lang)
        translated_text = trans.get('translated_text', '')

        # Create TTS audio for translated text
        try:
            audio_bytes = voice_service.text_to_speech(translated_text, language=target_lang)
            audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        except Exception as tts_err:
            audio_b64 = None

        return jsonify({'success': True, 'source_text': user_text, 'translated_text': translated_text, 'audio_base64': audio_b64})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/keywords', methods=['POST'])
def extract_keywords():
    try:
        data = request.get_json() or {}
        text = data.get('text') or data.get('source_text') or ''
        if not text:
            return jsonify({'success': False, 'error': 'No text provided'}), 400

        # Simple keyword extraction (kept lightweight)
        import re
        from collections import Counter

        stopwords = set(['the','and','a','an','is','in','on','at','of','to','for','with','that','this','it','was','were','are','be','by','from','as','or'])
        words = re.findall(r"\w+", text.lower())
        candidates = [w for w in words if len(w) > 2 and w not in stopwords]
        counts = Counter(candidates)
        most = [w for w,_ in counts.most_common(10)]
        return jsonify({'success': True, 'keywords': most[:5]})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/flashcards', methods=['POST'])
def generate_flashcards():
    try:
        data = request.get_json() or {}
        text = data.get('text') or data.get('source_text') or ''
        language = data.get('language', 'en')
        if not text:
            return jsonify({'success': False, 'error': 'No text provided'}), 400

        import re
        from collections import Counter

        stopwords = set(['the','and','a','an','is','in','on','at','of','to','for','with','that','this','it','was','were','are','be','by','from','as','or'])
        # split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        words = re.findall(r"\w+", text.lower())
        candidates = [w for w in words if len(w) > 3 and w not in stopwords]
        counts = Counter(candidates)
        top = [w for w,_ in counts.most_common(8)]

        flashcards = []
        for w in top:
            # find a sentence containing the word
            found = None
            for s in sentences:
                if w in s.lower():
                    found = s.strip()
                    break
            if not found:
                found = sentences[0] if sentences else ''
            front = re.sub(re.escape(w), '____', found, flags=re.IGNORECASE)
            back = w
            audio_b64 = None
            # attempt to generate audio for front using voice_service
            try:
                audio_bytes = voice_service.text_to_speech(front, language=language)
                if audio_bytes:
                    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
            except Exception:
                audio_b64 = None
            flashcards.append({'front': front, 'back': back, 'audio_base64': audio_b64})

        return jsonify({'success': True, 'flashcards': flashcards})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/conversation/start', methods=['POST'])
def start_conversation():
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id')
        language_pair = data.get('language_pair')
        if not session_id or not language_pair:
            return jsonify({'error': 'session_id and language_pair are required'}), 400
        conversation_service.start_conversation(session_id, language_pair)
        return jsonify({'success': True})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/conversation/add', methods=['POST'])
def add_conversation_message():
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id')
        message = data.get('message')
        direction = data.get('direction')
        if not session_id or not message or not direction:
            return jsonify({'error': 'session_id, message, and direction are required'}), 400
        result = conversation_service.add_message(session_id, message, direction)
        return jsonify({'success': True, **result})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/conversation/history/<session_id>', methods=['GET'])
def get_conversation_history(session_id):
    try:
        history = conversation_service.get_history(session_id)
        return jsonify({'success': True, 'history': history})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/practice/analyze', methods=['POST'])
def practice_analyze():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Audio file is required'}), 400
        audio_file = request.files['audio']
        target_text = request.form.get('target_text') or request.form.get('target') or ''
        language = request.form.get('language', 'en')
        if not target_text:
            return jsonify({'error': 'target_text is required'}), 400
        result = practice_service.analyze_pronunciation(audio_file, target_text, language)
        return jsonify({'success': True, **result})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print('='*60)
    print('AI TRANSLATOR BACKEND (clean)')
    print('Features: Text, Voice, Keywords, Conversation, Practice')
    print('Listening on http://localhost:5000')
    print('='*60)
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

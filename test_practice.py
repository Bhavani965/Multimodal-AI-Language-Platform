#!/usr/bin/env python3
"""
Simple test for the practice pronunciation endpoint.
Generates a short TTS audio file and POSTs it to the backend.
"""
import os
import requests
from gtts import gTTS
from tempfile import NamedTemporaryFile

URL = 'http://127.0.0.1:5000/api/practice/analyze'

text = 'Hello world'
lang = 'en'

# Create TTS MP3
with NamedTemporaryFile(delete=False, suffix='.mp3') as f:
    mp3_path = f.name
try:
    tts = gTTS(text=text, lang='en')
    tts.save(mp3_path)
    print(f'Generated TTS audio at: {mp3_path}')

    files = {'audio': (os.path.basename(mp3_path), open(mp3_path, 'rb'), 'audio/mpeg')}
    data = {'target_text': text, 'language': lang}

    print('Posting to practice endpoint...')
    resp = requests.post(URL, files=files, data=data)
    try:
        print('Status:', resp.status_code)
        print('Response JSON:')
        print(resp.json())
    except Exception:
        print('Response text:')
        print(resp.text)
finally:
    try:
        os.remove(mp3_path)
    except Exception:
        pass

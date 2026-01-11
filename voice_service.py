import speech_recognition as sr
from gtts import gTTS
from pydub import AudioSegment
import io
import os
import tempfile
import traceback

class VoiceService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        print("[INFO] VoiceService initialized with SpeechRecognition library.")
    
    def speech_to_text(self, audio_file, language='en'):
        temp_audio_path = None
        temp_wav_path = None
        try:
            # Save the uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".tmp") as tmp_file:
                audio_file.save(tmp_file.name)
                temp_audio_path = tmp_file.name

            # Try to load audio - try WAV first (most common), then webm
            audio_segment = None
            try:
                audio_segment = AudioSegment.from_file(temp_audio_path, format="wav")
            except Exception:
                try:
                    audio_segment = AudioSegment.from_file(temp_audio_path, format="webm")
                except Exception:
                    # Try auto-detection
                    try:
                        audio_segment = AudioSegment.from_file(temp_audio_path)
                    except Exception:
                        raise Exception("Unable to decode audio file - invalid format or corrupted data")
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as wav_file:
                audio_segment.export(wav_file.name, format="wav")
                temp_wav_path = wav_file.name

            with sr.AudioFile(temp_wav_path) as source:
                audio_data = self.recognizer.record(source)
            
            lang_code_map = {'en': 'en-US', 'es': 'es-ES', 'hi': 'hi-IN', 'kn': 'kn-IN'}
            api_lang_code = lang_code_map.get(language, language)

            try:
                text = self.recognizer.recognize_google(audio_data, language=api_lang_code)
                return {'text': text, 'language': language}
            except sr.UnknownValueError:
                return {'text': '', 'language': language, 'error': 'No speech detected in audio'}
            except sr.RequestError as e:
                raise Exception(f"Speech recognition service unavailable: {e}")
            except Exception as e:
                raise Exception(f"Speech recognition failed: {e}")
        
        finally:
            if temp_audio_path and os.path.exists(temp_audio_path): os.remove(temp_audio_path)
            if temp_wav_path and os.path.exists(temp_wav_path): os.remove(temp_wav_path)

    def text_to_speech(self, text, language='en'):
        try:
            tts = gTTS(text=text, lang=language, slow=False)
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            return audio_buffer.read()
        except Exception as e:
            raise Exception(f"Text-to-speech error: {e}")

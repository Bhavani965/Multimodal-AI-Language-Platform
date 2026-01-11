from deep_translator import GoogleTranslator
from deep_translator.constants import GOOGLE_LANGUAGES_TO_CODES


class TranslationService:
    def _normalize_code(self, code):
        """Normalize various language code formats to two-letter codes.

        Examples:
          'hin' -> 'hi', 'kan' -> 'kn', 'eng' -> 'en', 'HI' -> 'hi'
        """
        if not code:
            return code
        c = str(code).lower()
        mapping = {
            'hin': 'hi', 'hi': 'hi',
            'kan': 'kn', 'kn': 'kn',
            'eng': 'en', 'en': 'en'
        }
        if c in mapping:
            return mapping[c]
        # If already a 2-letter code, return it
        if len(c) == 2:
            return c
        # If a 3-letter tesseract-style code, try to map first two chars
        return c[:2]

    def translate(self, text, src_lang='auto', dest_lang='en'):
        try:
            # Normalize language codes to translator-friendly two-letter codes
            src_norm = 'auto' if (src_lang or '').lower() == 'auto' else self._normalize_code(src_lang)
            dest_norm = self._normalize_code(dest_lang) if dest_lang else 'en'

            # Try translation with resilient fallbacks
            translated_text = None
            try:
                if src_norm == 'auto':
                    # Some versions of deep_translator accept omitting source
                    try:
                        translated_text = GoogleTranslator(source='auto', target=dest_norm).translate(text)
                    except Exception:
                        translated_text = GoogleTranslator(target=dest_norm).translate(text)
                else:
                    translated_text = GoogleTranslator(source=src_norm, target=dest_norm).translate(text)
            except Exception as primary_err:
                # Fallback: try translating by only specifying the target
                try:
                    translated_text = GoogleTranslator(target=dest_norm).translate(text)
                except Exception as fallback_err:
                    print(f"Translation error primary: {primary_err}; fallback: {fallback_err}")
                    raise Exception("Translation failed. The language pair may not be supported.")

            # Detect language when source was 'auto'
            detected_lang = src_norm
            if src_norm == 'auto':
                # deep_translator's detect API is not always present; attempt safely
                try:
                    detector = GoogleTranslator()
                    if hasattr(detector, 'detect'):
                        det = detector.detect(text)
                        if isinstance(det, (list, tuple)) and det:
                            detected = det[0]
                        else:
                            detected = det
                        detected_lang = self._normalize_code(detected)
                    else:
                        detected_lang = 'unknown'
                except Exception:
                    detected_lang = 'unknown'

            return {
                'translated_text': translated_text,
                'source_language': detected_lang,
                'target_language': dest_norm,
            }
        except Exception as e:
            print(f"CRITICAL TRANSLATION ERROR: {e}")
            raise Exception("Translation failed. The input text may be too short for auto-detection or the language pair may not be supported.")

    def get_supported_languages(self):
        languages = [{'code': code, 'name': name.title()} for name, code in GOOGLE_LANGUAGES_TO_CODES.items()]
        return sorted(languages, key=lambda x: x['name'])
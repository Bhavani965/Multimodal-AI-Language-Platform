#!/usr/bin/env python3
"""
Simple test for image translation
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

print("Testing image translation setup...")

try:
    # Test imports
    from translation_service import TranslationService
    print("✓ Translation service imported")

    # Test translation
    ts = TranslationService()
    result = ts.translate("Hello world", 'en', 'es')
    print(f"✓ Translation works: '{result['translated_text']}'")

    # Test OCR service
    from ocr_service import OCRService
    print("✓ OCR service imported")

    # Test Flask app
    from app import app
    print("✓ Flask app imported")

    print("\n🎉 ALL BASIC TESTS PASSED!")
    print("\nTo start the server:")
    print("1. Run: python backend/app.py")
    print("2. Open frontend/index.html")
    print("3. Upload an image and click Translate")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()

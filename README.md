# Multimodal AI Language Learning Platform

A comprehensive multi-language translation application with text, voice, and image translation capabilities, similar to Google Translate but with unique features like pronunciation practice and conversation mode.

## 🌟 Features

### Core Features
- **Text Translation**: Translate text between 100+ languages
- **Voice Translation**: Speech-to-text and text-to-speech translation
- **Image Translation (OCR)**: Extract and translate text from images
- **Language Detection**: Auto-detect source language
- **Translation History**: Save and manage translation history
- **Favorites**: Bookmark favorite translations

### Unique Features
- **Pronunciation Practice**: Practice pronunciation with real-time feedback and scoring
- **Conversation Mode**: Real-time bidirectional translation for conversations
- **Batch Translation**: Translate multiple texts at once
- **Confidence Scores**: Display translation confidence levels
- **Alternative Translations**: Show alternative translation options
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Requirements

### Backend Requirements
- Python 3.8 or higher
- Flask
- Google Translate API (googletrans library)
- Speech Recognition libraries
- Tesseract OCR (for image translation)
- SQLite (for database)

### Frontend Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API calls)
- Microphone access (for voice features)
- Camera access (optional, for image capture)

### System Requirements
- **Windows**: Tesseract OCR installed at `C:\Program Files\Tesseract-OCR\tesseract.exe`
- **Linux**: Tesseract OCR installed via package manager
- **Mac**: Tesseract OCR installed via Homebrew

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd translator
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Tesseract OCR

#### Windows
1. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to: `C:\Program Files\Tesseract-OCR\`
3. The path is already configured in `backend/ocr_service.py`

#### Linux
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

#### Mac
```bash
brew install tesseract
```

### 3a. Install Tesseract Language Packs (Optional but Recommended)

For OCR in specific languages, you need to install corresponding Tesseract language data files:

#### Windows
1. Download language `.traineddata` files from: https://github.com/UB-Mannheim/tesseract/wiki/Downloads
2. Copy them to: `C:\Program Files\Tesseract-OCR\tessdata\`

**Recommended language packs for Indian languages:**
- `hin.traineddata` - Hindi
- `kan.traineddata` - Kannada
- `tam.traineddata` - Tamil
- `tel.traineddata` - Telugu
- `mal.traineddata` - Malayalam

**Quick install via Chocolatey (Windows):**
```bash
choco install tesseract --params="/InstallData"
```

#### Linux
```bash
sudo apt-get install tesseract-ocr-all
# Or install individual language packs:
sudo apt-get install tesseract-ocr-hin tesseract-ocr-kan tesseract-ocr-tam
```

#### Mac
```bash
brew install tesseract-lang
```

### 3b. Install Recommended Fonts (For Indic Scripts)

To properly display translated text in Indian languages, install fonts that support these scripts:

#### Windows

**Option 1: Manual Installation**
1. Download fonts from:
   - [Noto Sans Fonts](https://fonts.google.com/?query=noto+sans) (supports multiple scripts)
   - [Mangal Font](https://docs.microsoft.com/en-us/typography/font-list/mangal) (Hindi/Devanagari)
   - [Noto Sans Kannada](https://fonts.google.com/?query=noto+sans+kannada)
   - [Noto Sans Tamil](https://fonts.google.com/?query=noto+sans+tamil)
   - [Noto Sans Telugu](https://fonts.google.com/?query=noto+sans+telugu)
   - [Noto Sans Malayalam](https://fonts.google.com/?query=noto+sans+malayalam)

2. Extract and right-click → Install for all users

**Option 2: Chocolatey (automatic)**
```bash
choco install noto-sans-fonts
```

#### Linux
```bash
sudo apt-get install fonts-noto fonts-noto-devanagari fonts-noto-gujarati
sudo apt-get install fonts-noto-kannada fonts-noto-tamil fonts-noto-telugu fonts-noto-malayalam
```

#### Mac
```bash
brew tap homebrew/cask-fonts
brew install --cask font-noto-sans
brew install --cask font-noto-sans-devanagari
brew install --cask font-noto-sans-kannada
brew install --cask font-noto-sans-tamil
```

### 3c. Verify Installation

```bash
# Check Tesseract installation
tesseract --version

# Check available language packs
tesseract --list-langs
```

You should see a list of available languages including `hin`, `kan`, `tam`, etc. if installed.

### 4. Install Additional Dependencies (if needed)

#### For Audio Processing (Windows)
```bash
pip install pipwin
pipwin install pyaudio
```

#### For Audio Processing (Linux)
```bash
sudo apt-get install portaudio19-dev python3-pyaudio
```

#### For Audio Processing (Mac)
```bash
brew install portaudio
pip install pyaudio
```

## 🏃 Running the Application

### 1. Start the Backend Server
```bash
cd backend
python app.py
```

The backend server will start on `http://localhost:5000`

### 2. Open the Frontend
1. Open `frontend/index.html` in your web browser
2. Or use a local server:
```bash
cd frontend
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser

### 3. Update API URL (if needed)
If your backend is running on a different port, update the `API_BASE_URL` in `frontend/script.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📖 Usage

### Text Translation
1. Select source language (or "Auto Detect")
2. Select target language
3. Enter text in the source text area
4. Click "Translate" button
5. View translation in the target text area

### Voice Translation
1. Switch to "Voice" mode
2. Click "Record" button
3. Speak into your microphone
4. Click "Stop" button
5. View transcribed text and translation
6. Click "Play Translation" to hear the translated audio

### Image Translation
1. Switch to "Image" mode
2. Upload an image or drag & drop
3. Wait for OCR to extract text
4. View extracted text and translation

### Conversation Mode
1. Switch to "Conversation" mode
2. Select language pair
3. Click "Start Conversation"
4. Type messages and see real-time translations
5. Messages alternate between languages

### Pronunciation Practice
1. Switch to "Practice" mode
2. Enter text to practice
3. Select language
4. Click "Start Practice"
5. Speak the text
6. Click "Stop Recording"
7. View pronunciation score and feedback

## 🛠️ API Endpoints

### Text Translation
- `POST /api/translate` - Translate text
- `POST /api/detect` - Detect language
- `GET /api/languages` - Get supported languages

### Voice Translation
- `POST /api/voice/stt` - Speech-to-text
- `POST /api/voice/tts` - Text-to-speech
- `POST /api/voice/translate` - Complete voice translation

### OCR Translation
- `POST /api/ocr/translate` - Extract and translate text from image

### Pronunciation Practice
- `POST /api/practice/analyze` - Analyze pronunciation

### Conversation Mode
- `POST /api/conversation/start` - Start conversation
- `POST /api/conversation/add` - Add message to conversation
- `GET /api/conversation/history/<session_id>` - Get conversation history

### History & Favorites
- `GET /api/history` - Get translation history
- `GET /api/favorites` - Get favorite translations
- `POST /api/favorites` - Toggle favorite status

### Batch Translation
- `POST /api/batch/translate` - Translate multiple texts

## 📁 Project Structure

```
translator/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── translation_service.py # Text translation service
│   ├── voice_service.py       # Voice translation service
│   ├── ocr_service.py         # OCR service
│   ├── practice_service.py    # Pronunciation practice service
│   └── conversation_service.py # Conversation mode service
├── frontend/
│   ├── index.html            # Main HTML file
│   ├── styles.css            # CSS styles
│   └── script.js             # JavaScript functionality
├── requirements.txt          # Python dependencies
├── PROJECT_REQUIREMENTS.md   # Detailed requirements
└── README.md                # This file
```

## 🔧 Configuration

### Backend Configuration
- Default port: `5000`
- Database: `translator.db` (SQLite)
- CORS: Enabled for all origins (change in production)

### Frontend Configuration
- API URL: `http://localhost:5000/api`
- Theme: Stored in localStorage
- Session ID: Auto-generated per session

## 🐛 Troubleshooting

### OCR & Image Translation Issues

1. **"Tesseract OCR not found" warning on startup**
   - Install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
   - Verify installation: `tesseract --version`
   - For Windows, default path is: `C:\Program Files\Tesseract-OCR\tesseract.exe`
   - Restart the application after installation

2. **OCR times out or hangs (HTTP 504)**
   - This usually means Tesseract is missing or the process is very slow
   - Check if Tesseract is installed: `tesseract --version`
   - Install language packs for faster recognition: `tesseract --list-langs`
   - Ensure image is not extremely large (>10MB)
   - Try a simpler image first

3. **Translated text shows as empty boxes (tofu characters)**
   - This means the font doesn't support the target script
   - Install recommended fonts from section 3b above
   - Fonts for specific scripts:
     - Hindi/Devanagari: **Mangal**, Noto Sans Devanagari
     - Kannada: **Noto Sans Kannada**, Tunga
     - Tamil: **Noto Sans Tamil**, Lato
     - Telugu: **Noto Sans Telugu**
     - Malayalam: **Noto Sans Malayalam**
   - After installing fonts, restart the backend server

4. **No text detected in image**
   - Image quality may be too poor (very blurry, low contrast)
   - Try preprocessing: increase brightness/contrast before upload
   - Tesseract language pack for the source language may not be installed
   - Check available languages: `tesseract --list-langs`

5. **Wrong language detected in OCR**
   - Tesseract auto-detection may fail if image contains mixed scripts
   - Manually select the source language in the UI instead of "Auto Detect"
   - Ensure the language pack is installed for better accuracy

### Common Issues

1. **Tesseract OCR not found**
   - Ensure Tesseract is installed
   - Check the path in `backend/ocr_service.py`
   - For Linux/Mac, ensure Tesseract is in PATH

2. **Microphone not working**
   - Check browser permissions
   - Ensure microphone is not being used by another application
   - Try a different browser

3. **Translation API errors**
   - Check internet connection
   - The googletrans library may have rate limits
   - Consider using official Google Translate API for production

4. **Audio playback issues**
   - Check browser audio permissions
   - Ensure audio codecs are supported
   - Try a different browser

5. **CORS errors**
   - Ensure backend CORS is enabled
   - Check API URL in frontend
   - Verify backend is running

## 🚀 Deployment

### Backend Deployment
1. Use a production WSGI server (e.g., Gunicorn)
2. Set up environment variables
3. Configure database (PostgreSQL for production)
4. Set up reverse proxy (Nginx)
5. Enable HTTPS
6. Configure CORS for your domain

### Frontend Deployment
1. Build for production (minify CSS/JS)
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Update API URL to production backend
4. Enable HTTPS
5. Configure CORS on backend

## 📝 License

This project is created for educational purposes as part of an AIML internship project.

## 🙏 Acknowledgments

- Google Translate API (googletrans)
- Tesseract OCR
- Flask Framework
- Speech Recognition Library
- gTTS (Google Text-to-Speech)

## 📧 Contact

For questions or issues, please contact the project maintainer.

## 🎯 Future Enhancements

- [ ] Machine Learning models for better translation
- [ ] AR translation (translate text in real-world via camera)
- [ ] Document translation (PDF, Word, etc.)
- [ ] Website translation
- [ ] Real-time video subtitle translation
- [ ] Language learning games
- [ ] Community-driven translation improvements
- [ ] API for developers
- [ ] Mobile app (iOS/Android)
- [ ] Offline mode with local models

## 🔒 Security Notes

- This is a demo project for educational purposes
- For production use:
  - Implement authentication
  - Add rate limiting
  - Use environment variables for API keys
  - Enable HTTPS
  - Sanitize all inputs
  - Implement proper error handling
  - Use a production database
  - Set up logging and monitoring

---

**Note**: This project uses the `googletrans` library which is an unofficial Python library for Google Translate. For production use, consider using the official Google Cloud Translation API.




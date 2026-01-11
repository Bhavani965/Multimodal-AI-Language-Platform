// ==================================================================
// This is the DEMO-READY script.js file.
// It enables all features: Text, Voice, Image, Conversation, Practice
// ==================================================================

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    let mediaRecorder;
    let audioChunks = [];
    let translatedAudioUrl = null;

    // --- Element Selectors ---
    // Text Translation selectors
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');
    const translateTextBtn = document.getElementById('translateBtn');
    const sourceTextInput = document.getElementById('sourceText');
    const targetTextInput = document.getElementById('targetText');
    const swapLangBtn = document.getElementById('swapLang');

    // Voice Translation selectors
    const voiceSourceLangSelect = document.getElementById('voiceSourceLang');
    const voiceTargetLangSelect = document.getElementById('voiceTargetLang');
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const voiceSourceTextP = document.getElementById('voiceSourceText');
    const voiceTranslatedTextP = document.getElementById('voiceTranslatedText');
    const playTranslationBtn = document.getElementById('playVoiceTranslation');

    // Flashcards selectors (replaces Keywords)
    const flashcardsInput = document.getElementById('flashcardsInput');
    const generateFlashcardsBtn = document.getElementById('generateFlashcardsBtn');
    const flashcardsResult = document.getElementById('flashcardsResult');
    const flashcardsLanguage = document.getElementById('flashcardsLanguage');

    // Conversation selectors
    const conversationLangA = document.getElementById('conversationLangA');
    const conversationLangB = document.getElementById('conversationLangB');
    const startConversationBtn = document.getElementById('startConversationBtn');
    const conversationChat = document.getElementById('conversationChat');
    const conversationInput = document.getElementById('conversationInput');
    const sendConversationBtn = document.getElementById('sendConversationBtn');

    // Practice selectors
    const practiceTargetText = document.getElementById('practiceTargetText');
    const practiceLanguage = document.getElementById('practiceLanguage');
    const startPracticeBtn = document.getElementById('startPracticeBtn');
    const stopPracticeBtn = document.getElementById('stopPracticeBtn');
    const practiceResult = document.getElementById('practiceResult');
    const practiceScore = document.getElementById('practiceScore');
    const practiceFeedback = document.getElementById('practiceFeedback');
    const practiceImprovements = document.getElementById('practiceImprovements');

    // --- INITIALIZATION ---
    loadLanguages();
    setupEventListeners();

    // Helper: convert recorded Blob (webm) to WAV Blob using Web Audio
    async function convertBlobToWav(blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 48000 * 1, 48000);
            const decoded = await audioCtx.decodeAudioData(arrayBuffer);
            const numChannels = decoded.numberOfChannels;
            const sampleRate = decoded.sampleRate;
            const samples = decoded.length;

            // interleave channels
            let interleaved;
            if (numChannels === 2) {
                const left = decoded.getChannelData(0);
                const right = decoded.getChannelData(1);
                interleaved = new Float32Array(left.length + right.length);
                let index = 0;
                for (let i = 0; i < left.length; i++) {
                    interleaved[index++] = left[i];
                    interleaved[index++] = right[i];
                }
            } else {
                interleaved = decoded.getChannelData(0);
            }

            // convert float audio to 16-bit PCM
            const buffer = new ArrayBuffer(44 + interleaved.length * 2);
            const view = new DataView(buffer);

            function writeString(view, offset, string) {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + interleaved.length * 2, true);
            writeString(view, 8, 'WAVE');
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * numChannels * 2, true);
            view.setUint16(32, numChannels * 2, true);
            view.setUint16(34, 16, true);
            writeString(view, 36, 'data');
            view.setUint32(40, interleaved.length * 2, true);

            // write PCM samples
            let offset = 44;
            for (let i = 0; i < interleaved.length; i++, offset += 2) {
                let s = Math.max(-1, Math.min(1, interleaved[i]));
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }

            return new Blob([view], { type: 'audio/wav' });
        } catch (e) {
            console.warn('convertBlobToWav failed, sending original blob', e);
            return blob;
        }
    }

    // --- CORE FUNCTIONS ---
    async function loadLanguages() {
        try {
            const response = await fetch(`${API_BASE_URL}/languages`);
            const data = await response.json();
            if (data.success && Array.isArray(data.languages)) {
                const languages = data.languages;
                const allSelects = [sourceLangSelect, targetLangSelect, voiceSourceLangSelect, voiceTargetLangSelect, conversationLangA, conversationLangB, practiceLanguage, flashcardsLanguage];

                allSelects.forEach(select => {
                    if (!select) return;
                    select.innerHTML = '';
                    if (select.id === 'sourceLang' || select.id === 'voiceSourceLang') {
                        select.add(new Option('Auto Detect', 'auto'));
                    }
                    languages.forEach(lang => select.add(new Option(lang.name, lang.code)));
                });
                targetLangSelect.value = 'en';
                voiceTargetLangSelect.value = 'kn';
                conversationLangA.value = 'en';
                conversationLangB.value = 'es';
                practiceLanguage.value = 'en';
                if (flashcardsLanguage) flashcardsLanguage.value = 'en';
            } else {
                 alert("Error: Could not load languages from the server. Is the backend running?");
            }
        } catch (error) {
            alert("Network Error: Could not connect to the backend.");
        }
    }

    function setupEventListeners() {
        // Tab Switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => switchMode(btn.dataset.mode));
        });

        // Text Translation
        if (translateTextBtn) translateTextBtn.addEventListener('click', handleTextTranslation);
        if (swapLangBtn) swapLangBtn.addEventListener('click', handleSwapLanguages);

        // Voice Translation
        if (recordBtn) recordBtn.addEventListener('click', startRecording);
        if (stopBtn) stopBtn.addEventListener('click', stopRecording);
        if (playTranslationBtn) playTranslationBtn.addEventListener('click', () => {
            if (translatedAudioUrl) new Audio(translatedAudioUrl).play();
        });

        // Flashcards
        if (generateFlashcardsBtn) generateFlashcardsBtn.addEventListener('click', handleGenerateFlashcards);

        // Conversation
        if (startConversationBtn) startConversationBtn.addEventListener('click', startConversation);
        if (sendConversationBtn) sendConversationBtn.addEventListener('click', sendConversationMessage);
        if (conversationInput) conversationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendConversationMessage();
        });

        // Practice
        if (startPracticeBtn) startPracticeBtn.addEventListener('click', startPractice);
        if (stopPracticeBtn) stopPracticeBtn.addEventListener('click', stopPractice);
    }

    function switchMode(mode) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.mode-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        document.getElementById(`${mode}Mode`).classList.add('active');
    }

    async function handleTextTranslation() {
        const sourceText = sourceTextInput.value;
        if (!sourceText.trim()) return;
        try {
            const response = await fetch(`${API_BASE_URL}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_text: sourceText,
                    source_lang: sourceLangSelect.value,
                    target_lang: targetLangSelect.value
                })
            });
            const data = await response.json();
            if (data.success) {
                targetTextInput.value = data.translated_text;
            } else {
                alert('Text translation failed: ' + data.error);
            }
        } catch (error) {
            alert('Network error during text translation.');
        }
    }

    async function handleGenerateFlashcards() {
        const text = (flashcardsInput && flashcardsInput.value) || '';
        const language = (flashcardsLanguage && flashcardsLanguage.value) || 'en';
        if (!text.trim()) { alert('Please enter text to generate flashcards from.'); return; }
        try {
            const resp = await fetch(`${API_BASE_URL}/flashcards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language })
            });
            const data = await resp.json();
            if (data.success) {
                if (!data.flashcards || data.flashcards.length === 0) {
                    flashcardsResult.innerHTML = '<em>No flashcards generated.</em>';
                    return;
                }
                flashcardsResult.innerHTML = data.flashcards.map((c, idx) => {
                    const audioBtn = c.audio_base64 ? `<button data-b64="${c.audio_base64}" class="play-card-audio" data-idx="${idx}"><i class="fas fa-play"></i></button>` : '';
                    return `<div class="card" style="padding:10px;margin:8px 0;border-radius:6px;border:1px solid #ddd;background:#fafafa;">
                        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                            <strong>Card ${idx+1}</strong>
                            ${audioBtn}
                        </div>
                        <div style="margin-top:8px;font-size:15px;color:#222;">${c.front}</div>
                        <div style="margin-top:10px;color:#555"><em>Answer: ${c.back}</em></div>
                    </div>`;
                }).join('');

                // attach audio listeners
                document.querySelectorAll('.play-card-audio').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const b64 = e.currentTarget.getAttribute('data-b64');
                        if (!b64) return;
                        const blob = b64toBlob(b64, 'audio/mpeg');
                        const url = URL.createObjectURL(blob);
                        new Audio(url).play();
                    });
                });
            } else {
                alert('Flashcard generation failed: ' + (data.error||'Unknown'));
            }
        } catch (e) {
            alert('Network error generating flashcards.');
        }
    }

    function handleSwapLanguages() {
        const tempLang = sourceLangSelect.value;
        const tempText = sourceTextInput.value;
        sourceLangSelect.value = targetLangSelect.value;
        sourceTextInput.value = targetTextInput.value;
        targetLangSelect.value = tempLang;
        targetTextInput.value = tempText;
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                handleVoiceTranslation(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            recordBtn.style.display = 'none';
            stopBtn.style.display = 'block';
        } catch (err) {
            alert('Could not access microphone. Please check permissions.');
        }
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            recordBtn.style.display = 'block';
            stopBtn.style.display = 'none';
        }
    }

    async function handleVoiceTranslation(audioBlob) {
        voiceSourceTextP.textContent = 'Translating...';
        voiceTranslatedTextP.textContent = '';
        if (playTranslationBtn) playTranslationBtn.style.display = 'none';
        const formData = new FormData();
        // convert to WAV where possible to improve server-side speech recognition
        const wavBlob = await convertBlobToWav(audioBlob);
        const filename = (wavBlob.type === 'audio/wav') ? 'recording.wav' : 'recording.webm';
        formData.append('audio', wavBlob, filename);
        formData.append('source_lang', voiceSourceLangSelect.value);
        formData.append('target_lang', voiceTargetLangSelect.value);
        try {
            const response = await fetch(`${API_BASE_URL}/voice/translate`, {
                method: 'POST',
                body: formData
            });
            // Accept JSON or fallback to text
            let data;
            const ct = response.headers.get('Content-Type') || '';
            if (ct.includes('application/json')) {
                data = await response.json();
            } else {
                // try parse as text and then JSON, else show error
                const txt = await response.text();
                try { data = JSON.parse(txt); } catch (e) { throw new Error('Invalid JSON response from server'); }
            }
            if (response.ok && data.success) {
                voiceSourceTextP.textContent = data.source_text || "(No speech detected)";
                voiceTranslatedTextP.textContent = data.translated_text;
                const audioBlob = b64toBlob(data.audio_base64, 'audio/mpeg');
                translatedAudioUrl = URL.createObjectURL(audioBlob);
                if (playTranslationBtn) playTranslationBtn.style.display = 'inline-block';
            } else {
                alert('Error translating voice:\n\n' + data.error);
                voiceSourceTextP.textContent = 'An error occurred. Please try again.';
            }
        } catch (error) {
            alert('A network error occurred. Is the backend running?');
            voiceSourceTextP.textContent = 'Network error.';
        }
    }

    function b64toBlob(b64Data, contentType = '') {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
            byteArrays.push(new Uint8Array(byteNumbers));
        }
        return new Blob(byteArrays, { type: contentType });
    }

    // Image translation functions removed

    // --- Conversation Functions ---
    let currentSessionId = null;

    async function startConversation() {
        const langA = conversationLangA.value;
        const langB = conversationLangB.value;

        currentSessionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            const response = await fetch(`${API_BASE_URL}/conversation/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: currentSessionId,
                    language_pair: `${langA}-${langB}`
                })
            });
            const data = await response.json();

            if (data.success) {
                conversationChat.innerHTML = '<div class="chat-message system"><p>Conversation started. You can now exchange messages in real-time.</p></div>';
                conversationInput.disabled = false;
                sendConversationBtn.disabled = false;
                startConversationBtn.disabled = true;
            } else {
                alert('Failed to start conversation: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Network error during conversation start.');
        }
    }

    async function sendConversationMessage() {
        const message = conversationInput.value.trim();
        if (!message || !currentSessionId) return;

        // Add user message to chat
        conversationChat.insertAdjacentHTML('beforeend',
            `<div class="chat-message user"><p>${message}</p></div>`
        );
        conversationInput.value = '';

        try {
            const response = await fetch(`${API_BASE_URL}/conversation/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: currentSessionId,
                    message: message,
                    direction: 'a_to_b'
                })
            });
            const data = await response.json();

            if (data.success) {
                // Add translated message to chat
                conversationChat.insertAdjacentHTML('beforeend',
                    `<div class="chat-message bot"><p>${data.translated_message}</p></div>`
                );
                conversationChat.scrollTop = conversationChat.scrollHeight;
            } else {
                alert('Failed to send message: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Network error during message send.');
        }
    }

    // --- Practice Functions ---
    let practiceRecording = false;
    let practiceAudioChunks = [];

    async function startPractice() {
        const targetText = practiceTargetText.value.trim();
        if (!targetText) {
            alert('Please enter text to practice.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            practiceAudioChunks = [];
            mediaRecorder.ondataavailable = event => practiceAudioChunks.push(event.data);
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(practiceAudioChunks, { type: 'audio/webm' });
                await handlePracticeAnalysis(audioBlob, targetText, practiceLanguage.value);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            practiceRecording = true;
            startPracticeBtn.style.display = 'none';
            stopPracticeBtn.style.display = 'block';
        } catch (err) {
            alert('Could not access microphone. Please check permissions.');
        }
    }

    function stopPractice() {
        if (mediaRecorder && practiceRecording) {
            mediaRecorder.stop();
            practiceRecording = false;
            startPracticeBtn.style.display = 'block';
            stopPracticeBtn.style.display = 'none';
        }
    }

    async function handlePracticeAnalysis(audioBlob, targetText, language) {
        const formData = new FormData();
        // convert to WAV to help server recognition
        const wavBlob = await convertBlobToWav(audioBlob);
        formData.append('audio', wavBlob, wavBlob.type === 'audio/wav' ? 'practice.wav' : 'recording.webm');
        formData.append('target_text', targetText);
        formData.append('language', language);

        try {
            const response = await fetch(`${API_BASE_URL}/practice/analyze`, {
                method: 'POST',
                body: formData
            });
            let data;
            const ct = response.headers.get('Content-Type') || '';
            if (ct.includes('application/json')) data = await response.json();
            else {
                const txt = await response.text();
                try { data = JSON.parse(txt); } catch(e) { throw new Error('Invalid JSON from practice endpoint'); }
            }

            if (data.success) {
                practiceScore.textContent = data.score;
                practiceFeedback.textContent = data.feedback;
                practiceImprovements.innerHTML = data.improvements.map(imp =>
                    `<li>${imp}</li>`).join('');
                practiceResult.style.display = 'block';
            } else {
                alert('Practice analysis failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Network error during practice analysis.');
        }
    }
});

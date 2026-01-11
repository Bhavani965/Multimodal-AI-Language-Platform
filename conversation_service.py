"""
Conversation Service for real-time bidirectional translation
Manages conversation sessions and message history
"""

import sqlite3
from datetime import datetime
try:
    from .translation_service import TranslationService
except Exception:
    from translation_service import TranslationService

class ConversationService:
    def __init__(self):
        self.translation_service = TranslationService()
    
    def start_conversation(self, session_id, language_pair):
        """
        Start a new conversation session
        
        Args:
            session_id: Unique session identifier
            language_pair: Language pair (e.g., 'en-es')
        """
        try:
            conn = sqlite3.connect('translator.db')
            c = conn.cursor()
            c.execute('''
                INSERT OR REPLACE INTO conversations (session_id, language_pair)
                VALUES (?, ?)
            ''', (session_id, language_pair))
            conn.commit()
            conn.close()
        except Exception as e:
            raise Exception(f"Error starting conversation: {str(e)}")
    
    def add_message(self, session_id, message, direction):
        """
        Add a message to conversation and translate it
        
        Args:
            session_id: Conversation session ID
            message: Message text
            direction: 'a_to_b' or 'b_to_a'
        
        Returns:
            dict: Translated message and timestamp
        """
        try:
            # Get language pair from conversation
            conn = sqlite3.connect('translator.db')
            c = conn.cursor()
            c.execute('SELECT language_pair FROM conversations WHERE session_id = ?', (session_id,))
            result = c.fetchone()
            
            if not result:
                raise Exception("Conversation session not found")
            
            language_pair = result[0]
            lang_a, lang_b = language_pair.split('-')
            
            # Determine translation direction
            if direction == 'a_to_b':
                source_lang = lang_a
                target_lang = lang_b
            else:
                source_lang = lang_b
                target_lang = lang_a
            
            # Translate message
            translation_result = self.translation_service.translate(
                text=message,
                src_lang=source_lang,
                dest_lang=target_lang
            )
            
            translated_message = translation_result['translated_text']
            timestamp = datetime.now().isoformat()
            
            # Save message to database
            c.execute('''
                INSERT INTO conversation_messages 
                (conversation_id, message_text, translated_text, direction, timestamp)
                VALUES (?, ?, ?, ?, ?)
            ''', (session_id, message, translated_message, direction, timestamp))
            
            conn.commit()
            conn.close()
            
            return {
                'translated_message': translated_message,
                'timestamp': timestamp
            }
        
        except Exception as e:
            raise Exception(f"Error adding message: {str(e)}")
    
    def get_history(self, session_id):
        """
        Get conversation history
        
        Args:
            session_id: Conversation session ID
        
        Returns:
            list: Conversation messages
        """
        try:
            conn = sqlite3.connect('translator.db')
            c = conn.cursor()
            c.execute('''
                SELECT message_text, translated_text, direction, timestamp
                FROM conversation_messages
                WHERE conversation_id = ?
                ORDER BY timestamp ASC
            ''', (session_id,))
            
            rows = c.fetchall()
            conn.close()
            
            history = []
            for row in rows:
                history.append({
                    'original': row[0],
                    'translated': row[1],
                    'direction': row[2],
                    'timestamp': row[3]
                })
            
            return history
        
        except Exception as e:
            raise Exception(f"Error getting history: {str(e)}")









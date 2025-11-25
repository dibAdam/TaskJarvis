import spacy
import dateparser
import re
from datetime import datetime

class CommandParser:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Warning: spaCy model 'en_core_web_sm' not found. NLP features will be limited.")
            self.nlp = None

    def parse(self, text):
        """
        Parses natural language text into a command dictionary.
        Returns: {'intent': str, 'entities': dict}
        """
        text = text.lower().strip()
        
        if self.nlp:
            doc = self.nlp(text)
        
        # Basic Intent Recognition
        intent = "unknown"
        if text.startswith("add") or "remind me to" in text:
            intent = "add"
        elif "list" in text or "show" in text:
            intent = "list"
        elif "delete" in text or "remove" in text:
            intent = "delete"
        elif "complete" in text or "finish" in text:
            intent = "complete"
        
        entities = {}
        
        if intent == "add":
            # Extract title and deadline
            # Simple heuristic: "add task [title] [deadline]" or "remind me to [title] [deadline]"
            
            # Remove trigger phrases
            clean_text = text
            triggers = ["add task", "add", "remind me to"]
            for t in triggers:
                if clean_text.startswith(t):
                    clean_text = clean_text[len(t):].strip()
                    break
            
            # Extract Date using dateparser (or spaCy if needed for location)
            # We'll try to find a date at the end of the string
            # This is a naive approach; a better one uses spaCy to find DATE entities
            
            deadline = None
            title = clean_text
            
            if self.nlp:
                doc = self.nlp(text) # Re-parse original text to find dates
                for ent in doc.ents:
                    if ent.label_ == "DATE" or ent.label_ == "TIME":
                        # Attempt to parse this entity
                        dt = dateparser.parse(ent.text)
                        if dt:
                            deadline = dt.strftime("%Y-%m-%d %H:%M:%S")
                            # Remove the date string from title
                            # This is tricky because ent.text might not match exactly in clean_text if case changed
                            # But we lowercased everything.
                            title = title.replace(ent.text, "").strip()
            
            # Fallback if no spaCy or no date found
            if not deadline:
                # Try checking the last few words for time
                # (Very basic)
                pass

            entities = {
                "title": title,
                "deadline": deadline,
                "priority": "Medium" # Default
            }
            
        elif intent == "delete" or intent == "complete":
            # Extract ID
            # "delete task 1" -> 1
            match = re.search(r'\d+', text)
            if match:
                entities["id"] = int(match.group())
                
        return {
            "intent": intent,
            "entities": entities
        }

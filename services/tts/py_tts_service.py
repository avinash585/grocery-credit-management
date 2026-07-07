import http.server
import json
import pyttsx3
import threading

class SpeechEngine:
    def __init__(self):
        # Initialize pyttsx3 speech engine
        self.engine = pyttsx3.init()
        self.lock = threading.Lock()
        
    def speak(self, text, lang_code=None):
        with self.lock:
            if lang_code:
                # Retrieve available voices to match language context
                voices = self.engine.getProperty('voices')
                for voice in voices:
                    if lang_code.lower() in voice.id.lower() or any(lang_code.lower() in l.lower() for l in voice.languages):
                        self.engine.setProperty('voice', voice.id)
                        break
            self.engine.say(text)
            self.engine.runAndWait()

# Thread-safe global speech engine
speech_engine = SpeechEngine()

class TTSRequestHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/speak':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                text = data.get('text', '')
                lang = data.get('lang', '') # e.g. "ta", "hi", "en"
                
                if text:
                    # Run speech in background thread to avoid blocking HTTP response
                    threading.Thread(target=speech_engine.speak, args=(text, lang)).start()
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success", "message": f"Speaking: {text}"}).encode('utf-8'))
                else:
                    self.send_error(400, "Missing 'text' parameter")
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Not Found")
            
    def do_OPTIONS(self):
        # CORS preflight responses for Web client browsers
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    server_address = ('', 5002)
    httpd = http.server.HTTPServer(server_address, TTSRequestHandler)
    print("Python TTS Service running on port 5002...")
    print("Call POST http://localhost:5002/speak with JSON: {'text': 'hello', 'lang': 'en'}")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()

import os
import urllib.request
import json

API_KEY = """sk-project-0QW3vX1xY2Z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9qrsTUVWXyz"""

req = urllib.request.Request(
    "https://api.openai.com/v1/models",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        if resp.status == 200:
            print("API key is valid")
            data = json.loads(resp.read())
            print("Models accessible:", len(data.get("data", [])))
except urllib.error.HTTPError as e:
    if e.code == 401:
        print("Invalid or revoked API key")
    elif e.code == 403:
        print("Key valid but lacks permission")
    else:
        print("HTTP error:", e.code)
except Exception as e:
    print("Network or other error:", e)

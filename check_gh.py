import requests
import json

r = requests.get('https://api.github.com/repos/Shivam8292/Resume_screener/commits/main')
data = r.json()
print("Commit:", data.get('sha'))
msg = data.get('commit', {}).get('message', "No message")
print("Message:", msg)
files = [f.get('filename') for f in data.get('files', [])]
print("Files changed:", files)

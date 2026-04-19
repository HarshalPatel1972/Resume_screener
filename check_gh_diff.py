import requests

r = requests.get('https://api.github.com/repos/Shivam8292/Resume_screener/commits/6971b96bef24e153836e8deb0453310d7054debf')
data = r.json()
with open('git_diff.txt', 'w', encoding='utf-8') as f:
    f.write(data.get('commit', {}).get('message', '') + '\n\n')
    for file in data.get('files', []):
        f.write(f"--- {file.get('filename')} ---\n")
        f.write(file.get('patch', 'No patch string') + '\n\n')

import html
import re

def search_content(content):
    targets = [
        "Парижко усещане",
        "Военен клуб Русе",
        "Летен Театър Русе",
        "20:30",
        "Art Label Production",
        "kupibileti.bg",
        "Одрин"
    ]
    
    keys = [
        "start_time",
        "event_place",
        "place",
        "location",
        "ticket",
        "external_url",
        "url",
        "description"
    ]
    
    print("--- Searching Targets ---")
    for target in targets:
        # Case insensitive search
        index = content.find(target)
        if index != -1:
            snippet = content[max(0, index-50):index+len(target)+50].replace('\n', ' ')
            print(f"FOUND: '{target}'")
            print(f"SNIPPET: ...{snippet}...")
        else:
            print(f"NOT FOUND: '{target}'")

    print("\n--- Searching Keys ---")
    for key in keys:
        # Looking for keys in JSON or likely structured data (e.g., "key":)
        pattern = re.compile(f'"{key}"\s*:\s*')
        match = pattern.search(content)
        if match:
            start = match.start()
            snippet = content[start:start+200].replace('\n', ' ')
            print(f"FOUND KEY: '{key}'")
            print(f"SNIPPET: {snippet}...")
        else:
            # Check without quotes just in case
            if key in content:
                index = content.find(key)
                snippet = content[max(0, index-20):index+len(key)+80].replace('\n', ' ')
                print(f"FOUND KEY (plain): '{key}'")
                print(f"SNIPPET: ...{snippet}...")
            else:
                print(f"NOT FOUND KEY: '{key}'")

with open('facebook_event.html', 'r', encoding='utf-8', errors='ignore') as f:
    raw_content = f.read()
    # Double unescape because FB often escapes JSON strings within HTML
    decoded_content = html.unescape(html.unescape(raw_content))
    search_content(decoded_content)

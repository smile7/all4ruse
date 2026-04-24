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
    
    print("--- Searching Targets (Case Insensitive & Unicode Escaped) ---")
    for target in targets:
        # Check standard
        if target.lower() in content.lower():
            index = content.lower().find(target.lower())
            snippet = content[max(0, index-50):index+len(target)+50].replace('\n', ' ')
            print(f"FOUND: '{target}'")
            print(f"SNIPPET: ...{snippet}...")
        else:
            # Check unicode escaped form for Cyrillic
            unicode_target = target.encode('unicode-escape').decode().replace('\\u', r'\\u')
            if unicode_target in content:
                index = content.find(unicode_target)
                snippet = content[max(0, index-50):index+len(unicode_target)+50].replace('\n', ' ')
                print(f"FOUND (Unicode Escaped): '{target}'")
                print(f"SNIPPET: ...{snippet}...")
            else:
                print(f"NOT FOUND: '{target}'")

with open('facebook_event.html', 'r', encoding='utf-8', errors='ignore') as f:
    raw_content = f.read()
    decoded_content = html.unescape(raw_content)
    search_content(decoded_content)

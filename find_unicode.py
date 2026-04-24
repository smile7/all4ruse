import re
import html

# Convert Cyrillic strings to double-escaped unicode like \u0410
def to_fb_unicode(s):
    return "".join(f"\\u{ord(c):04x}" for c in s)

targets = {
    "Парижко усещане": "Парижко усещане",
    "Военен клуб Русе": "Военен клуб Русе",
    "Летен Театър Русе": "Летен Театър Русе",
    "Одрин": "Одрин"
}

with open('facebook_event.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

for name, text in targets.items():
    uni = to_fb_unicode(text)
    # FB often uses single backslash in source, but we search for the escaped string
    if uni in content:
        print(f"FOUND UNICODE: {name} (as {uni})")
        idx = content.find(uni)
        print(f"SNIPPET: {content[idx-50:idx+len(uni)+100]}")
    else:
        # Check lowercase version
        uni_low = to_fb_unicode(text.lower())
        if uni_low in content:
            print(f"FOUND UNICODE (lower): {name} (as {uni_low})")
        else:
            print(f"NOT FOUND: {name}")


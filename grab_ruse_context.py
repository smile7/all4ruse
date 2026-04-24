import re
import html

with open('facebook_event.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Look for mentions of "Русе" or related terms and show surrounding text
matches = re.finditer(r'(.{0,100}Русе.{0,100})', content)
for i, match in enumerate(matches):
    text = match.group(1)
    print(f"Match {i}: {html.unescape(text)}")
    if i > 10: break


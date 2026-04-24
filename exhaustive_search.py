import html
import re

with open('facebook_event.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Try searching for small sub-strings that are harder to miss
search_terms = ["Париж", "клуб", "Театър", "Русе", "Ruse", "2026", "20:30"]
for term in search_terms:
    if term in content or term.lower() in content.lower():
        print(f"FOUND: {term}")
    else:
        # Check for numeric HTML entities or unicode escape
        pass

print("\n--- Examining Meta Description Decoding ---")
# Example: &#x421;&#x44a;&#x431;&#x438;&#x442;&#x438;&#x435;
import html
desc_match = re.search(r'name="description" content="([^"]+)"', content)
if desc_match:
    desc = desc_match.group(1)
    print(f"Decoded Description: {html.unescape(desc)}")


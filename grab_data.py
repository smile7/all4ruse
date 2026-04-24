import re
import html

with open('facebook_event.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Look for anything that looks like JSON data containing event info
# FB events often have a large JSON blob with "day_of_week", "start_timestamp", etc.
print("--- Context around Art Label Production ---")
pattern = re.compile(r'.{100}Art Label Production.{100}', re.DOTALL)
for match in pattern.finditer(content):
    print(f"MATCH: {match.group(0)}")

print("\n--- Looking for potential times (HH:MM) ---")
time_pattern = re.compile(r'\b\d{1,2}:\d{2}\b')
times = time_pattern.findall(content)
print(f"Times found: {set(times)}")


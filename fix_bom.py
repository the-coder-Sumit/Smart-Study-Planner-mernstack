import os

def remove_bom(filepath):
    with open(filepath, 'rb') as f:
        raw = f.read()
    if raw.startswith(b'\xef\xbb\xbf'):
        with open(filepath, 'wb') as f:
            f.write(raw[3:])
        print(f"Removed BOM from {filepath}")

for root, dirs, files in os.walk('client/src'):
    for file in files:
        if file.endswith('.js') or file.endswith('.css'):
            remove_bom(os.path.join(root, file))

for root, dirs, files in os.walk('server'):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    for file in files:
        if file.endswith('.js'):
            remove_bom(os.path.join(root, file))

import json

with open("frontend/src/assets/Backup_Characters_Previous/characters_atlas.json") as f:
    atlas = json.load(f)

frames = atlas.get("frames", {})
print("Backup atlas keys:", list(frames.keys()))

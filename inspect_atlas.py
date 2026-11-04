import json

with open("frontend/src/assets/Spritesheets/characters_atlas.json") as f:
    atlas = json.load(f)

frames = atlas.get("frames", {})
for char in ["char_0", "char_1", "char_2", "char_3"]:
    print(f"=== {char} ===")
    for d in ["down", "south", "right", "east", "side", "left", "west", "up", "north"]:
        kf = f"{char}_idle_{d}"
        kw = f"{char}_walk_{d}"
        print(f"  {d:6s} => idle: {frames.get(kf, {}).get('frame')} | walk: {frames.get(kw, {}).get('frame')}")

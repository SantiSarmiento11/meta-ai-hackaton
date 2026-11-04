import json

with open("frontend/src/assets/Spritesheets/characters_atlas.json") as f:
    atlas = json.load(f)

frames = atlas["frames"]
dirs = ["south", "southeast", "east", "northeast", "north", "northwest", "west", "southwest"]
for d in dirs:
    print(f"{d:10s} => idle: {frames.get('char_0_idle_' + d, {}).get('frame')} | walk: {frames.get('char_0_walk_' + d, {}).get('frame')}")

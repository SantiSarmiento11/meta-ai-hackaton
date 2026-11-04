from PIL import Image
import json

with open("frontend/src/assets/Spritesheets/characters_atlas.json") as f:
    atlas = json.load(f)

im = Image.open("frontend/src/assets/Spritesheets/Hoja de sprites pixel art transparente.png")
frames = atlas.get("frames", {})

# Let's crop and save char_0 idle and walk in all directions to a folder to analyze
import os
os.makedirs("temp_check_frames", exist_ok=True)

directions = ['south', 'southeast', 'east', 'northeast', 'north', 'northwest', 'west', 'southwest',
              'down', 'up', 'left', 'right', 'side']

for char in ['char_0', 'char_1']:
    for d in directions:
        for action in ['idle', 'walk']:
            key = f"{char}_{action}_{d}"
            if key in frames:
                finfo = frames[key]["frame"]
                crop = im.crop((finfo["x"], finfo["y"], finfo["x"] + finfo["w"], finfo["y"] + finfo["h"]))
                crop.save(f"temp_check_frames/{key}.png")

print("Saved frames to temp_check_frames")

from PIL import Image
import numpy as np

hoja = Image.open("frontend/src/assets/Spritesheets/Hoja de sprites pixel art transparente.png")
ceo = Image.open("frontend/src/assets/Spritesheets/Characters Final Version/CEO.png")

import json
with open("frontend/src/assets/Spritesheets/characters_atlas.json") as f:
    atlas = json.load(f)

for action in ['idle', 'walk']:
    for d in ['down', 'up', 'left', 'right', 'side', 'south', 'north', 'east', 'west', 'southeast', 'southwest', 'northeast', 'northwest']:
        k = f"char_0_{action}_{d}"
        if k in atlas['frames']:
            f = atlas['frames'][k]['frame']
            crop = hoja.crop((f['x'], f['y'], f['x']+f['w'], f['y']+f['h']))
            crop.save(f"temp_check_frames/{k}.png")

print("Saved all char_0 frames to temp_check_frames")

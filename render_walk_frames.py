from PIL import Image
import numpy as np
import json

with open("frontend/src/assets/Spritesheets/characters_atlas.json") as f:
    atlas = json.load(f)

hoja = Image.open("frontend/src/assets/Spritesheets/Hoja de sprites pixel art transparente.png")
frames = atlas["frames"]

def ascii_frame(k, width=28):
    f = frames[k]['frame']
    crop = hoja.crop((f['x'], f['y'], f['x']+f['w'], f['y']+f['h']))
    aspect = crop.height / crop.width
    height = int(aspect * width * 0.48)
    crop = crop.resize((width, height), Image.Resampling.NEAREST)
    arr = np.array(crop)
    lines = []
    for y in range(height):
        line = ""
        for x in range(width):
            r, g, b, a = arr[y, x]
            if a < 50:
                line += " "
            elif r > 140 and g > 80 and r > b + 15:
                line += "@"
            elif r < 60 and g < 60 and b < 60:
                line += "."
            else:
                line += "+"
        lines.append(line)
    return "\n".join(lines)

for k in ['char_0_idle_east', 'char_0_walk_east', 'char_0_idle_west', 'char_0_walk_west', 'char_0_walk_down', 'char_0_walk_up']:
    print(f"=== {k} ===")
    print(ascii_frame(k))

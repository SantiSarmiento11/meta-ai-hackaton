from PIL import Image
import numpy as np

hoja = Image.open("frontend/src/assets/Spritesheets/Hoja de sprites pixel art transparente.png")

# Let's inspect char_0 (y: 0..840) and each of the 8 columns in row 1 (y: 0..180) and row 2 (y: 180..350)
import json
with open("frontend/src/assets/Spritesheets/characters_atlas.json") as f:
    atlas = json.load(f)

for k in ['char_0_idle_south', 'char_0_idle_east', 'char_0_idle_north', 'char_0_idle_west',
          'char_0_walk_south', 'char_0_walk_east', 'char_0_walk_north', 'char_0_walk_west',
          'char_0_walk_side', 'char_0_walk_left', 'char_0_walk_right', 'char_0_walk_up', 'char_0_walk_down']:
    f = atlas['frames'][k]['frame']
    print(f"{k:20s}: x={f['x']:4d}, y={f['y']:4d}, w={f['w']:3d}, h={f['h']:3d}")

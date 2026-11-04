import json
from PIL import Image
import numpy as np

with open("frontend/src/assets/Spritesheets/characters_atlas.json") as f:
    atlas = json.load(f)

hoja = Image.open("frontend/src/assets/Spritesheets/Hoja de sprites pixel art transparente.png")
frames = atlas["frames"]

# Let's inspect the 8 directions of char_0 in hoja
dirs = ['south', 'southeast', 'east', 'northeast', 'north', 'northwest', 'west', 'southwest']

for d in dirs:
    f_idle = frames[f"char_0_idle_{d}"]["frame"]
    f_walk = frames[f"char_0_walk_{d}"]["frame"]
    crop_idle = hoja.crop((f_idle['x'], f_idle['y'], f_idle['x']+f_idle['w'], f_idle['y']+f_idle['h']))
    crop_walk = hoja.crop((f_walk['x'], f_walk['y'], f_walk['x']+f_walk['w'], f_walk['y']+f_walk['h']))
    
    # Analyze idle:
    arr = np.array(crop_idle)
    h, w = arr.shape[:2]
    # Check head skin
    head = arr[:int(h*0.4), :, :]
    rgb = head[:, :, :3]
    a = head[:, :, 3]
    skin = (rgb[:, :, 0] > 140) & (rgb[:, :, 1] > 90) & (rgb[:, :, 0] > rgb[:, :, 2] + 25) & (a > 50)
    skin_cnt = skin.sum()
    skin_x = np.where(skin)[1].mean() / w if skin_cnt > 0 else -1
    
    # Check chest
    chest = arr[int(h*0.3):int(h*0.65), :, :]
    c_rgb = chest[:, :, :3]
    c_a = chest[:, :, 3]
    bright = ((c_rgb[:, :, 0] > 150) & (c_rgb[:, :, 1] > 150) & (c_a > 50)).sum()
    
    print(f"dir={d:9s} | idle x={f_idle['x']:4d}, w={f_idle['w']:3d} | skin={skin_cnt:3d}, cx={skin_x:.2f}, bright={bright:3d} | walk x={f_walk['x']:4d}")

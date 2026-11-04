import json
from PIL import Image
import numpy as np

with open("frontend/src/assets/Spritesheets/characters_atlas.json") as f:
    atlas = json.load(f)

hoja = Image.open("frontend/src/assets/Spritesheets/Hoja de sprites pixel art transparente.png")
frames = atlas["frames"]

for char in ['char_0', 'char_1', 'char_2', 'char_3']:
    print(f"=== {char} ===")
    for d in ['south', 'east', 'north', 'west', 'down', 'up', 'left', 'right', 'side']:
        k = f"{char}_idle_{d}"
        if k in frames:
            f = frames[k]['frame']
            crop = hoja.crop((f['x'], f['y'], f['x']+f['w'], f['y']+f['h']))
            arr = np.array(crop)
            h, w = arr.shape[:2]
            head = arr[:int(h*0.4), :, :]
            rgb = head[:, :, :3]
            a = head[:, :, 3]
            skin = (rgb[:, :, 0] > 130) & (rgb[:, :, 1] > 80) & (rgb[:, :, 0] > rgb[:, :, 2] + 15) & (a > 50)
            cnt = skin.sum()
            cx = np.where(skin)[1].mean() / w if cnt > 0 else 0.5
            print(f"  {d:5s}: x={f['x']:4d}, y={f['y']:4d}, w={f['w']:3d}, h={f['h']:3d} | skin={cnt:4d}, cx={cx:.2f}")

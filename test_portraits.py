import os
from PIL import Image
import numpy as np

for i in range(4):
    for kind in ['avatar', 'full']:
        p = f"frontend/src/assets/characters/char_{i}_{kind}.png"
        if os.path.exists(p):
            im = Image.open(p).convert("RGBA")
            arr = np.array(im)
            alpha = arr[:, :, 3]
            h, w = arr.shape[:2]
            head_arr = arr[:int(h*0.45), :, :]
            head_a = alpha[:int(h*0.45), :]
            rgb = head_arr[:, :, :3]
            skin = (rgb[:, :, 0] > 130) & (rgb[:, :, 1] > 80) & (rgb[:, :, 0] > rgb[:, :, 2] + 15) & (head_a > 50)
            skin_count = skin.sum()
            cx = np.where(skin)[1].mean() / w if skin_count > 0 else 0.5
            print(f"char_{i}_{kind}: size={w}x{h}, skin_px={skin_count:4d}, skin_cx={cx:.2f}")

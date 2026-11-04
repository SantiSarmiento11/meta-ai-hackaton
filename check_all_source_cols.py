import os
from PIL import Image
import numpy as np

files = [
    ("char_0", "CEO.png"),
    ("char_1", "Co-Worker.png"),
    ("char_2", "Secretaria.png"),
    ("char_3", "Manager.png")
]

col_bands = [
    (180, 289),
    (341, 457),
    (503, 616),
    (664, 778),
    (825, 931),
    (986, 1132),
    (1171, 1282),
    (1355, 1489),
]

for char_id, filename in files:
    path = os.path.join("frontend/src/assets/Spritesheets/Characters Final Version", filename)
    im = Image.open(path).convert("RGBA")
    print(f"=== {char_id} ({filename}) ===")
    for c_idx, (x1, x2) in enumerate(col_bands):
        # crop row 1 (idle) and row 2 (walk)
        crop = im.crop((x1, 110, x2, 275))
        arr = np.array(crop)
        alpha = arr[:, :, 3]
        ys, xs = np.where(alpha > 30)
        if not len(ys):
            print(f"  Col {c_idx+1}: EMPTY")
            continue
        char_w = xs.max() - xs.min()
        char_h = ys.max() - ys.min()
        char_arr = arr[ys.min():ys.max()+1, xs.min():xs.max()+1]
        char_a = alpha[ys.min():ys.max()+1, xs.min():xs.max()+1]
        
        # head skin
        head = char_arr[:int(char_h*0.38), :]
        rgb = head[:, :, :3]
        a = char_a[:int(char_h*0.38), :]
        skin = (rgb[:, :, 0] > 130) & (rgb[:, :, 1] > 80) & (rgb[:, :, 0] > rgb[:, :, 2] + 15) & (a > 50)
        cnt = skin.sum()
        cx = np.where(skin)[1].mean() / char_w if cnt > 0 else 0.5
        
        # chest bright
        chest = char_arr[int(char_h*0.3):int(char_h*0.65), :]
        c_rgb = chest[:, :, :3]
        c_a = char_a[int(char_h*0.3):int(char_h*0.65), :]
        bright = ((c_rgb[:, :, 0] > 150) & (c_rgb[:, :, 1] > 150) & (c_a > 50)).sum()
        
        print(f"  Col {c_idx+1} ({x1}..{x2}): skin={cnt:4d}, cx={cx:.2f}, chest_bright={bright:4d}")

from PIL import Image
import numpy as np

im = Image.open("frontend/src/assets/Spritesheets/Characters Final Version/CEO.png").convert("RGBA")

col_bands = [
    ("Col 1", 180, 289),
    ("Col 2", 341, 457),
    ("Col 3", 503, 616),
    ("Col 4", 664, 778),
    ("Col 5", 825, 931),
    ("Col 6", 986, 1132),
    ("Col 7", 1171, 1282),
    ("Col 8", 1355, 1489),
]

for idx, (name, x1, x2) in enumerate(col_bands):
    crop = im.crop((x1, 294, x2, 456)) # R2 walk
    arr = np.array(crop)
    alpha = arr[:, :, 3]
    h, w = arr.shape[:2]
    ys, xs = np.where(alpha > 30)
    if not len(ys):
        continue
    char_w = xs.max() - xs.min()
    char_h = ys.max() - ys.min()
    char_arr = arr[ys.min():ys.max()+1, xs.min():xs.max()+1]
    char_a = alpha[ys.min():ys.max()+1, xs.min():xs.max()+1]
    
    head_h = int(char_h * 0.38)
    head_arr = char_arr[:head_h, :]
    rgb = head_arr[:, :, :3]
    head_a = char_a[:head_h, :]
    skin = (rgb[:, :, 0] > 140) & (rgb[:, :, 1] > 80) & (rgb[:, :, 0] > rgb[:, :, 2] + 20) & (head_a > 50)
    skin_cnt = skin.sum()
    skin_cx = np.where(skin)[1].mean() / char_w if skin_cnt > 0 else 0.5
    
    chest_arr = char_arr[int(char_h*0.3):int(char_h*0.65), :]
    c_rgb = chest_arr[:, :, :3]
    c_a = char_a[int(char_h*0.3):int(char_h*0.65), :]
    bright = ((c_rgb[:, :, 0] > 150) & (c_rgb[:, :, 1] > 150) & (c_a > 50)).sum()
    
    print(f"R2 (walk) {name:5s}: size={char_w:2d}x{char_h:2d}, skin={skin_cnt:4d}, skin_cx={skin_cx:.2f}, chest_bright={bright:4d}")

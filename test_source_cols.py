from PIL import Image
import numpy as np

im = Image.open("frontend/src/assets/Spritesheets/Characters Final Version/CEO.png").convert("RGBA")

# Columns in CEO.png:
# In previous run:
# Col 0: (9, 139) -> sleeping
# Col 1: (180, 289)
# Col 2: (341, 457)
# Col 3: (503, 616)
# Col 4: (664, 778)
# Col 5: (825, 931)
# Col 6: (986, 1132)
# Col 7: (1171, 1282)
# Col 8: (1355, 1489)

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

for name, x1, x2 in col_bands:
    # crop row 1 (standing idle)
    c = im.crop((x1, 110, x2, 275))
    arr = np.array(c)
    alpha = arr[:, :, 3]
    h, w = arr.shape[:2]
    
    # get content bbox
    ys, xs = np.where(alpha > 30)
    bx1, bx2 = xs.min(), xs.max()
    by1, by2 = ys.min(), ys.max()
    char_w = bx2 - bx1
    char_h = by2 - by1
    
    char_arr = arr[by1:by2, bx1:bx2]
    char_a = alpha[by1:by2, bx1:bx2]
    
    # Head region (0 to 38% of char height)
    head_h = int(char_h * 0.38)
    head_arr = char_arr[:head_h, :]
    head_a = char_a[:head_h, :]
    
    # Chest region (30% to 65%)
    chest_arr = char_arr[int(char_h*0.3):int(char_h*0.65), :]
    chest_a = char_a[int(char_h*0.3):int(char_h*0.65), :]
    
    # Skin
    rgb = head_arr[:, :, :3]
    skin = (rgb[:, :, 0] > 140) & (rgb[:, :, 1] > 90) & (rgb[:, :, 0] > rgb[:, :, 2] + 25) & (head_a > 50)
    skin_count = skin.sum()
    if skin_count > 0:
        s_ys, s_xs = np.where(skin)
        skin_cx = s_xs.mean() / char_w
    else:
        skin_cx = 0.5
        
    # Chest brightness
    c_rgb = chest_arr[:, :, :3]
    bright_chest = (c_rgb[:, :, 0] > 150) & (c_rgb[:, :, 1] > 150) & (chest_a > 50)
    bright_count = bright_chest.sum()
    
    print(f"{name:5s} (x={x1:4d}..{x2:4d}): size={char_w:2d}x{char_h:2d}, skin={skin_count:4d}, skin_cx={skin_cx:.2f}, chest_bright={bright_count:4d}")

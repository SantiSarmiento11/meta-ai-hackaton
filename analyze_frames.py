import os
from PIL import Image
import numpy as np

def analyze_character_frame(path):
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    alpha = arr[:, :, 3]
    h, w = arr.shape[:2]
    
    # Head region (y from 0 to 40% of height)
    head_h = int(h * 0.4)
    head_arr = arr[:head_h, :, :]
    head_a = alpha[:head_h, :]
    
    # Chest region (y from 30% to 65% of height)
    chest_arr = arr[int(h*0.3):int(h*0.65), :, :]
    chest_a = alpha[int(h*0.3):int(h*0.65), :]
    
    # Skin detector (for Alex Vance / char_0: skin is roughly R:180-255, G:120-190, B:90-160, R > B + 30)
    rgb = head_arr[:, :, :3]
    skin = (rgb[:, :, 0] > 140) & (rgb[:, :, 1] > 90) & (rgb[:, :, 0] > rgb[:, :, 2] + 25) & (head_a > 50)
    
    skin_count = skin.sum()
    if skin_count > 0:
        ys, xs = np.where(skin)
        skin_cx = xs.mean() / w
    else:
        skin_cx = 0.5
        
    # Chest brightness (tie/shirt is bright, back of jacket is dark)
    c_rgb = chest_arr[:, :, :3]
    bright_chest = (c_rgb[:, :, 0] > 150) & (c_rgb[:, :, 1] > 150) & (chest_a > 50)
    bright_count = bright_chest.sum()
    
    return skin_count, skin_cx, bright_count, w, h

for d in ['south', 'southeast', 'east', 'northeast', 'north', 'northwest', 'west', 'southwest']:
    f_idle = f"temp_check_frames/char_0_idle_{d}.png"
    if os.path.exists(f_idle):
        sc, scx, bc, w, h = analyze_character_frame(f_idle)
        print(f"{d:10s}: skin={sc:4d}, skin_cx={scx:.2f}, chest_bright={bc:4d}")

from PIL import Image
import numpy as np

for fname in ['char_0_walk_side.png', 'char_0_idle_side.png', 'char_0_walk_east.png', 'char_0_walk_west.png', 'char_0_walk_southeast.png', 'char_0_walk_southwest.png']:
    im = Image.open(f"temp_check_frames/{fname}").convert("RGBA")
    arr = np.array(im)
    h, w = arr.shape[:2]
    # Check left half vs right half of the image
    left_half = arr[:, :w//2, :]
    right_half = arr[:, w//2:, :]
    
    # Skin
    def get_skin(crop):
        rgb = crop[:, :, :3]
        a = crop[:, :, 3]
        return ((rgb[:, :, 0] > 140) & (rgb[:, :, 1] > 80) & (rgb[:, :, 0] > rgb[:, :, 2] + 20) & (a > 50)).sum()
    
    l_skin = get_skin(left_half)
    r_skin = get_skin(right_half)
    
    print(f"{fname:25s}: left_half_skin={l_skin:3d}, right_half_skin={r_skin:3d}")

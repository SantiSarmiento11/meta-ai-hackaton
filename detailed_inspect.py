from PIL import Image
import numpy as np

def inspect_frame(name):
    im = Image.open(f"temp_check_frames/{name}.png").convert("RGBA")
    arr = np.array(im)
    h, w = arr.shape[:2]
    # Check head
    head = arr[:int(h*0.38), :, :]
    rgb = head[:, :, :3]
    a = head[:, :, 3]
    skin = (rgb[:, :, 0] > 140) & (rgb[:, :, 1] > 80) & (rgb[:, :, 0] > rgb[:, :, 2] + 20) & (a > 50)
    cnt = skin.sum()
    skin_x = np.where(skin)[1].mean() / w if cnt > 0 else 0.5
    
    # Check chest
    chest = arr[int(h*0.3):int(h*0.65), :, :]
    c_rgb = chest[:, :, :3]
    c_a = chest[:, :, 3]
    bright = ((c_rgb[:, :, 0] > 150) & (c_rgb[:, :, 1] > 150) & (c_a > 50)).sum()
    
    # Check feet (bottom 25%)
    feet = arr[int(h*0.75):, :, :]
    f_a = feet[:, :, 3] > 50
    f_cnt = f_a.sum()
    f_cx = np.where(f_a)[1].mean() / w if f_cnt > 0 else 0.5
    
    print(f"{name:20s}: w={w:2d}, h={h:2d} | head_skin={cnt:3d}, cx={skin_x:.2f} | chest_bright={bright:3d} | feet_cx={f_cx:.2f}")

for action in ['idle', 'walk']:
    for d in ['down', 'up', 'left', 'right', 'side', 'south', 'north', 'east', 'west', 'southeast', 'southwest', 'northeast', 'northwest']:
        inspect_frame(f"char_0_{action}_{d}")

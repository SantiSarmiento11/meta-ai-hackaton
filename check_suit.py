from PIL import Image
import numpy as np

im = Image.open("frontend/src/assets/Spritesheets/Characters Final Version/CEO.png").convert("RGBA")

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

for idx, (x1, x2) in enumerate(col_bands):
    crop = im.crop((x1, 110, x2, 275))
    arr = np.array(crop)
    # Check chest region (y between 150 and 210 in im, which is 40 to 100 in crop)
    chest = arr[40:100, :, :]
    c_a = chest[:, :, 3] > 50
    c_rgb = chest[:, :, :3]
    
    # White shirt: r > 180, g > 180, b > 180
    shirt = (c_rgb[:, :, 0] > 180) & (c_rgb[:, :, 1] > 180) & (c_rgb[:, :, 2] > 180) & c_a
    # Tie: in CEO, what color is the tie? Let's check non-dark non-white pixels
    tie = (c_rgb[:, :, 0] > 100) & (c_rgb[:, :, 1] < 100) & c_a # red/colored tie?
    
    print(f"Col {idx+1} (x={x1}..{x2}): shirt_white_px={shirt.sum():3d}, tie_px={tie.sum():3d}")

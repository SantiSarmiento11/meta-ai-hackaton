from PIL import Image
import numpy as np

# Compare char_0_full.png with the 8 columns of row 1 in CEO.png
char0 = np.array(Image.open("frontend/src/assets/characters/char_0_full.png").convert("RGBA"))
ceo = np.array(Image.open("frontend/src/assets/Spritesheets/Characters Final Version/CEO.png").convert("RGBA"))

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
    crop = ceo[110:275, x1:x2]
    # find bbox
    a = crop[:, :, 3] > 30
    ys, xs = np.where(a)
    c_sub = crop[ys.min():ys.max()+1, xs.min():xs.max()+1]
    diff = -1
    if c_sub.shape == char0.shape:
        diff = np.abs(c_sub.astype(int) - char0.astype(int)).mean()
    print(f"Col {idx+1} vs char_0_full: shape={c_sub.shape} vs {char0.shape}, diff={diff}")

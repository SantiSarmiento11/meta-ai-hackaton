from PIL import Image
import numpy as np

im = Image.open("frontend/src/assets/Spritesheets/Characters Final Version/CEO.png").convert("RGBA")
# Row bands were:
# R0: (21, 89)
# R1: (110, 275)
# R2: (294, 456)
# R3: (480, 595)
# R4: (620, 737)
# R5: (763, 874)
# R6: (903, 990)

row_names = ["R0 (labels)", "R1 (idle?)", "R2 (walk?)", "R3 (talking?)", "R4 (seated?)", "R5 (agitated?)", "R6 (collapsed?)"]
row_bands = [(21, 89), (110, 275), (294, 456), (480, 595), (620, 737), (763, 874), (903, 990)]

for r_idx, (y1, y2) in enumerate(row_bands):
    crop = im.crop((180, y1, 289, y2)) # Col 1 (Front/South)
    arr = np.array(crop)
    a = arr[:, :, 3] > 40
    if a.any():
        ys, xs = np.where(a)
        print(f"{row_names[r_idx]}: y={y1}..{y2}, size={xs.max()-xs.min()}x{ys.max()-ys.min()}")

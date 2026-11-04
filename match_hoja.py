from PIL import Image
import numpy as np

hoja = np.array(Image.open("frontend/src/assets/Spritesheets/Hoja de sprites pixel art transparente.png"))
ceo = np.array(Image.open("frontend/src/assets/Spritesheets/Characters Final Version/CEO.png"))

# Hoja has char_0 in 0..1200, 0..840
# In Hoja, char_0_idle_east is at x=334, y=7, w=82, h=164
crop_hoja = hoja[7:7+164, 334:334+82]

# Let's find where in CEO this 82x164 block exists
for col_idx in range(9):
    # check each column in CEO row 1 (110..275)
    # search across x
    pass

# Direct search:
found = False
for y in range(0, 1024 - 164, 10):
    for x in range(0, 1536 - 82, 10):
        sub = ceo[y:y+164, x:x+82]
        if np.array_equal(sub, crop_hoja):
            print(f"EXACT MATCH at CEO x={x}, y={y}!")
            found = True
            break
    if found:
        break

if not found:
    # try min diff
    min_diff = 999999
    best_pos = None
    for y in range(100, 300, 5):
        for x in range(0, 1536 - 82, 10):
            sub = ceo[y:y+164, x:x+82]
            d = np.abs(sub.astype(int) - crop_hoja.astype(int)).mean()
            if d < min_diff:
                min_diff = d
                best_pos = (x, y)
    print(f"Best match at {best_pos} with diff {min_diff}")

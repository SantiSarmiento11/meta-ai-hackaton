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
    crop = im.crop((x1, 110, x2, 275))
    # crop row 0 (text above the column!)
    crop_text = im.crop((x1, 20, x2, 90))
    crop.save(f"temp_col_{idx+1}.png")
    crop_text.save(f"temp_text_{idx+1}.png")
    print(f"Saved temp_col_{idx+1}.png and temp_text_{idx+1}.png")

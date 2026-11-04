from PIL import Image
import numpy as np

def ascii_character(img_path, width=32):
    im = Image.open(img_path).convert("RGBA")
    # find bbox
    arr = np.array(im)
    a = arr[:, :, 3] > 40
    if not a.any():
        return "EMPTY"
    ys, xs = np.where(a)
    crop = im.crop((xs.min(), ys.min(), xs.max()+1, ys.max()+1))
    
    aspect_ratio = crop.height / crop.width
    height = int(aspect_ratio * width * 0.48)
    crop = crop.resize((width, height), Image.Resampling.NEAREST)
    arr = np.array(crop)
    
    lines = []
    for y in range(height):
        line = ""
        for x in range(width):
            r, g, b, alpha = arr[y, x]
            if alpha < 50:
                line += " "
            elif r > 140 and g > 80 and r > b + 15: # skin
                line += "@"
            elif r > 160 and g > 160 and b > 160: # white shirt
                line += "#"
            elif r < 60 and g < 60 and b < 60: # dark suit / hair
                line += "."
            else:
                line += "+"
        lines.append(line)
    return "\n".join(lines)

for i in range(1, 9):
    print(f"==================== COL {i} ====================")
    print(ascii_character(f"temp_col_{i}.png", 28))

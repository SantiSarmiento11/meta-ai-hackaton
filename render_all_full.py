from PIL import Image
import numpy as np

def ascii_char(img_path, width=28):
    im = Image.open(img_path).convert("RGBA")
    aspect_ratio = im.height / im.width
    height = int(aspect_ratio * width * 0.5)
    im = im.resize((width, height), Image.Resampling.NEAREST)
    arr = np.array(im)
    
    lines = []
    for y in range(height):
        line = ""
        for x in range(width):
            r, g, b, a = arr[y, x]
            if a < 50:
                line += " "
            elif r > 140 and g > 80 and r > b + 15:
                line += "@"
            elif r > 160 and g > 160 and b > 160:
                line += "#"
            elif r < 60 and g < 60 and b < 60:
                line += "."
            else:
                line += "+"
        lines.append(line)
    return "\n".join(lines)

for i in range(4):
    print(f"=== CHAR_{i}_FULL ===")
    print(ascii_char(f"frontend/src/assets/characters/char_{i}_full.png", 26))

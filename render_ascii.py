from PIL import Image
import numpy as np

def ascii_art(img_path, width=40):
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
            elif r > 140 and g > 90 and r > b + 20: # skin tone
                line += "@"
            elif r > 180 and g > 180 and b > 180: # white shirt
                line += "#"
            elif r < 60 and g < 60 and b < 60: # dark suit/hair
                line += "."
            else:
                line += "+"
        lines.append(line)
    return "\n".join(lines)

print("=== CHAR_0 SOUTH (x=34) ===")
print(ascii_art("temp_check_frames/char_0_idle_south.png", 30))

print("=== CHAR_0 NORTH (x=636) ===")
print(ascii_art("temp_check_frames/char_0_idle_north.png", 30))

print("=== CHAR_0 EAST (x=334) ===")
print(ascii_art("temp_check_frames/char_0_idle_east.png", 30))

print("=== CHAR_0 WEST (x=912) ===")
print(ascii_art("temp_check_frames/char_0_idle_west.png", 30))

from PIL import Image
import numpy as np

for i in range(1, 9):
    im = Image.open(f"temp_text_{i}.png").convert("RGBA")
    arr = np.array(im)
    a = arr[:, :, 3] > 50
    if not a.any():
        print(f"Text {i}: EMPTY")
        continue
    ys, xs = np.where(a)
    sub = arr[ys.min():ys.max()+1, xs.min():xs.max()+1]
    # render simple ascii of text
    lines = []
    # resize height to 12 rows
    target_h = min(12, sub.shape[0])
    target_w = int(sub.shape[1] * (target_h / sub.shape[0]) * 1.8)
    sub_img = Image.fromarray(sub).resize((target_w, target_h), Image.Resampling.BILINEAR)
    s_arr = np.array(sub_img)
    for y in range(target_h):
        line = "".join("#" if s_arr[y, x, 3] > 80 else " " for x in range(target_w))
        lines.append(line)
    print(f"=== Text {i} (original {xs.max()-xs.min()}x{ys.max()-ys.min()}) ===")
    print("\n".join(lines))

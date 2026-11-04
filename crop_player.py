from PIL import Image

im = Image.open(r"C:\Users\Santiago Sarmiento\.gemini\antigravity\brain\f3e264c7-d432-405c-a4e5-bcb359b840b9\.system_generated\steps\640\media_0.png")
# The center is around (960, 540)
# Let's crop (750, 400, 1150, 750)
crop = im.crop((750, 450, 1150, 750))
crop.save("temp_player_crop.png")
print("Saved temp_player_crop.png")

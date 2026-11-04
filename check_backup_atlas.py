import json

with open("frontend/src/assets/Backup_Characters_Previous/characters_atlas.json") as f:
    atlas = json.load(f)

frames = atlas.get("frames", {})
print("Backup atlas total frames:", len(frames))
for k in ['char_0_frame_0', 'char_0_idle_down', 'char_0_idle_up', 'char_0_idle_side', 'char_0_walk_down', 'char_0_walk_up', 'char_0_walk_side']:
    if k in frames:
        print(k, frames[k]['frame'])

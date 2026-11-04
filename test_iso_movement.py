import math

topVertex = (848, 297)
stepU = (34.40, 15.15)
stepV = (-34.40, 15.15)

def gridToWorld(col, row):
    x = topVertex[0] + col * stepU[0] + row * stepV[0]
    y = topVertex[1] + col * stepU[1] + row * stepV[1]
    return x, y

p0 = gridToWorld(10, 10) # Player spawn at (10, 10) = (848, 600)
print("Spawn:", p0)

# Move along +col (down-right along isometric grid)
p_col_plus = gridToWorld(15, 10) # col 15, row 10
dx = p_col_plus[0] - p0[0]
dy = p_col_plus[1] - p0[1]
angle = math.atan2(dy, dx)
deg = math.degrees(angle)
print(f"Moving +col (grid right/down-right): dx={dx:.1f}, dy={dy:.1f}, angle={deg:.1f} deg")

# Move along +row (down-left along isometric grid)
p_row_plus = gridToWorld(10, 15)
dx = p_row_plus[0] - p0[0]
dy = p_row_plus[1] - p0[1]
angle = math.atan2(dy, dx)
deg = math.degrees(angle)
print(f"Moving +row (grid left/down-left): dx={dx:.1f}, dy={dy:.1f}, angle={deg:.1f} deg")

# Move along -col (up-left along isometric grid)
p_col_minus = gridToWorld(5, 10)
dx = p_col_minus[0] - p0[0]
dy = p_col_minus[1] - p0[1]
angle = math.atan2(dy, dx)
deg = math.degrees(angle)
print(f"Moving -col (grid up-left): dx={dx:.1f}, dy={dy:.1f}, angle={deg:.1f} deg")

# Move along -row (up-right along isometric grid)
p_row_minus = gridToWorld(10, 5)
dx = p_row_minus[0] - p0[0]
dy = p_row_minus[1] - p0[1]
angle = math.atan2(dy, dx)
deg = math.degrees(angle)
print(f"Moving -row (grid up-right): dx={dx:.1f}, dy={dy:.1f}, angle={deg:.1f} deg")

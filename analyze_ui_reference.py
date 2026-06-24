from PIL import Image
import sys

# Redirect stderr to null to hide warnings
sys.stderr = open('nul', 'w')

try:
    print("--- START ANALYSIS ---")
    path = "Captura de pantalla 2026-01-16 073949.png"
    img = Image.open(path)
    img = img.convert('RGB')
    width, height = img.size
    print(f"Size: {width}x{height}")

    # Horizontal Scan for Content Blocks
    # We sum the brightness of each column
    column_brightness = []
    
    # Sample every 5th column for speed
    for x in range(0, width, 5):
        col_sum = 0
        # Sample every 5th row
        for y in range(0, height, 5):
            r, g, b = img.getpixel((x, y))
            col_sum += (r + g + b)
        
        # Avg Brightness 0-255
        samples = (height // 5)
        avg = col_sum / (samples * 3) if samples > 0 else 0
        column_brightness.append(avg)

    # Detect Blocks (Sensitivity 20/255)
    threshold = 20 
    blocks = []
    in_block = False
    start_index = 0
    
    for i, b in enumerate(column_brightness):
        if b > threshold and not in_block:
            in_block = True
            start_index = i
        elif b <= threshold and in_block:
            in_block = False
            # Convert back to pixels (x5 scale)
            start_px = start_index * 5
            end_px = i * 5
            width_px = end_px - start_px
            
            if width_px > 50: # Filter small noise
                center = start_px + (width_px // 2)
                blocks.append((start_px, end_px, center))
    
    # Handle if block ends at edge
    if in_block:
        start_px = start_index * 5
        end_px = width
        width_px = end_px - start_px
        if width_px > 50:
            center = start_px + (width_px // 2)
            blocks.append((start_px, end_px, center))

    print(f"Found {len(blocks)} Distinct Elements:")
    for i, (s, e, c) in enumerate(blocks):
        pos_label = "Left" if c < width/3 else ("Right" if c > 2*width/3 else "Center")
        print(f"Element {i+1}: {pos_label} (Width: {e-s}px)")

    print("--- END ANALYSIS ---")

except Exception as e:
    print(f"Error: {e}")

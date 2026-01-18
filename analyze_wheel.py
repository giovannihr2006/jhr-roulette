import math
import sys
from PIL import Image

# Standard European Roulette Sequence (Clockwise)
# Starting at 0.
EURO_SEQ = [
    (0, 'G'), (32, 'R'), (15, 'B'), (19, 'R'), (4, 'B'), (21, 'R'), 
    (2, 'B'), (25, 'R'), (17, 'B'), (34, 'R'), (6, 'B'), (27, 'R'), 
    (13, 'B'), (36, 'R'), (11, 'B'), (30, 'R'), (8, 'B'), (23, 'R'), 
    (10, 'B'), (5, 'R'), (24, 'B'), (16, 'R'), (33, 'B'), (1, 'R'), 
    (20, 'B'), (14, 'R'), (31, 'B'), (9, 'R'), (22, 'B'), (18, 'R'), 
    (29, 'B'), (7, 'R'), (28, 'B'), (12, 'R'), (35, 'B'), (3, 'R'), 
    (26, 'B')
]

def classify_pixel(r, g, b):
    # Heuristic for Roulette Colors
    # Green: High G, Lower R/B (or specific dark green)
    # Red: High R, Lower G/B
    # Black: Low R, G, B (or dark grey)
    # White/Text: High R, G, B
    
    # Brightness check
    brightness = (r + g + b) / 3
    if brightness > 210: return 'W' 
    if brightness < 30: return 'K' 
    
    # Enhanced Color Logic
    # Green in roulette is often dark emerald.
    # If G is the dominant channel, even if low, it's likely Green.
    
    if g > r and g > b:
        # Check if it's not just grey noise
        if g > (r + b) * 0.4: return 'G'

    if r > g * 1.3 and r > b * 1.3:
        return 'R'
    
    # If not Red or Green, and not White Logic -> Black
    return 'B'

def analyze_image(path):
    try:
        img = Image.open(path).convert('RGB')
        width, height = img.size
        cx, cy = width // 2, height // 2
        
        print(f"Analyzing {path} ({width}x{height})")
        print(f"Center estimated at: {cx}, {cy}")

        # Scan multiple radii to find the "Color Ring"
        # We assume the wheel fills most of the image
        min_radius = min(width, height) * 0.2
        max_radius = min(width, height) * 0.45
        step = (max_radius - min_radius) / 10
        
        found_matches = []
        
        for r in range(int(min_radius), int(max_radius), int(step//2)):
            colors_found = []
            # Scan 360 degrees
            # We use 370 steps to overlap slightly
            for angle in range(0, 360, 1): 
                # Angle correction: 0 usually starts at 3 o'clock in math, 
                # but roulette images often have 0 at 12 o'clock (270 deg)
                # We'll valid all rotations later.
                rad = math.radians(angle)
                px = int(cx + r * math.cos(rad))
                py = int(cy + r * math.sin(rad))
                
                if 0 <= px < width and 0 <= py < height:
                    pixel = img.getpixel((px, py))
                    code = classify_pixel(*pixel)
                    if code in ['R', 'B', 'G']:
                        # Simple Run-Length Encoding to avoid duplicates
                        if not colors_found or colors_found[-1] != code:
                            colors_found.append(code)
            
            # Clean up the sequence (remove noise)
            # A valid roulette sequence should look like G, R, B, R, B...
            # Ignoring W (separators)
            if len(colors_found) > 10: # Must have found at least some pockets
                found_matches.append((r, "".join(colors_found)))

        # ... (Previous Scanning Logic) ...

        # PATTERN MATCHING ENGINE
        print("-" * 40)
        print("DEEP ANALYSIS REPORT")
        print("-" * 40)

        euro_str = "".join([x[1] for x in EURO_SEQ]) 
        # Create a search buffer (double length to handle rotation)
        search_buffer = euro_str + euro_str
        
        best_match_conf = 0
        best_rotation = -1
        detected_geometry = "Unknown"

        for radius, raw_seq in found_matches:
            # We treat the raw_seq as a noisy signal
            # We try to align 'G' (Zero)
            
            # Simple substring check isn't enough for noise.
            # We'll use a sliding window with Hamming distance
            
            # Check length: A full wheel should have ~37 pockets
            # If our resolution is high, we might have multiple pixels per pocket.
            # We need to simplify the raw_seq to "state changes"
            
            # Compress: RRRRRBBBBB -> RB
            compressed_seq = ""
            if not raw_seq: continue
            
            last_char = raw_seq[0]
            compressed_seq += last_char
            count = 1
            segment_lengths = []
            
            for char in raw_seq[1:]:
                if char != last_char:
                    compressed_seq += char
                    segment_lengths.append(count)
                    last_char = char
                    count = 1
                else:
                    count += 1
            segment_lengths.append(count)
            
            # Filter noise (tiny segments < 2 pixels likely artifacts)
            clean_seq = ""
            for i, char in enumerate(compressed_seq):
                if segment_lengths[i] > 1: # Basic noise filter
                    clean_seq += char
                    
            if len(clean_seq) < 10: continue

            # SEARCH FOR EURO PATTERN
            # Standard: G R B R B R ...
            # We look for the 'G' (Green Zero) as anchor
            
            if 'G' in clean_seq:
                # We found a zero!
                # Let's see the neighbors
                g_index = clean_seq.find('G')
                
                # Extract neighbors from image
                sub = clean_seq[g_index:g_index+10] # Next 10 colors
                
                # Compare with Euro: G R B R B R B R B R... (0, 32, 15, 19, 4...)
                euro_sub = "GRBRBRBRBR"
                
                match_score = 0
                min_len = min(len(sub), len(euro_sub))
                for k in range(min_len):
                    if sub[k] == euro_sub[k]: match_score += 1
                
                confidence = match_score / 10 * 100
                
                if confidence > best_match_conf:
                    best_match_conf = confidence
                    detected_geometry = f"Ring at Radius {radius}"
                    
                    # Infer Numbers
                    print(f"✅ MATCH FOUND in {detected_geometry}")
                    print(f"   Pattern Detect: {sub}...")
                    print(f"   Confidence: {confidence}%")
                    print(f"   Identity: EUROPEAN SINGLE ZERO CLASSIFIED")
                    return # Stop after finding the best ring
                    
        if best_match_conf < 50:
             print("⚠️  No definitive STANDARD pattern found.")
             print("Longest Pattern Found (Raw):")
             # Print the longest sequence from matches
             matches = sorted(found_matches, key=lambda x: len(x[1]), reverse=True)
             if matches:
                 print(f"Radius {matches[0][0]}: {matches[0][1]}")
        else:
             print("Analysis Complete.")


    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_image("cilindro ruleta.webp")

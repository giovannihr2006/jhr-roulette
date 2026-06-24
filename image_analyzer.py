"""
Image Analyzer Utility
Reads an image from the clipboard or a file path and displays information about it.
"""
import sys
from pathlib import Path

def analyze_image(image_path: str):
    """Analyze an image and print detailed information."""
    try:
        from PIL import Image
        import os
        
        # Open the image
        img = Image.open(image_path)
        
        # Get basic info
        width, height = img.size
        mode = img.mode
        format_name = img.format or "Unknown"
        
        print(f"\n{'='*50}")
        print(f"IMAGE ANALYSIS: {Path(image_path).name}")
        print(f"{'='*50}")
        print(f"Path: {image_path}")
        print(f"Dimensions: {width}x{height} pixels")
        print(f"Mode: {mode}")
        print(f"Format: {format_name}")
        print(f"File Size: {os.path.getsize(image_path) / 1024:.1f} KB")
        
        # Color analysis
        if mode in ('RGB', 'RGBA'):
            # Get dominant colors
            img_small = img.resize((50, 50))
            pixels = list(img_small.getdata())
            
            # Count colors
            from collections import Counter
            color_counts = Counter(pixels)
            top_colors = color_counts.most_common(5)
            
            print(f"\nTop 5 Colors (RGB):")
            for color, count in top_colors:
                if isinstance(color, tuple):
                    r, g, b = color[:3]
                    print(f"  RGB({r:3d}, {g:3d}, {b:3d}) - {count} pixels")
        
        # Check for specific UI elements based on color ranges
        print(f"\n{'='*50}")
        print("UI ELEMENT DETECTION:")
        print(f"{'='*50}")
        
        # Convert to RGB if needed
        if mode != 'RGB':
            img_rgb = img.convert('RGB')
        else:
            img_rgb = img
        
        # Sample regions
        pixels = list(img_rgb.getdata())
        total = len(pixels)
        
        # Count specific color ranges
        green_count = 0
        gold_count = 0
        red_count = 0
        black_count = 0
        
        for p in pixels:
            r, g, b = p[:3]
            # Green (table felt): high G, low R and B
            if g > 50 and g > r and g > b and r < 100:
                green_count += 1
            # Gold (border): high R and G, low B
            elif r > 150 and g > 100 and b < 100:
                gold_count += 1
            # Red (roulette cells)
            elif r > 150 and g < 80 and b < 80:
                red_count += 1
            # Black/dark
            elif r < 50 and g < 50 and b < 50:
                black_count += 1
        
        print(f"Green (table felt): {green_count/total*100:.1f}%")
        print(f"Gold (borders): {gold_count/total*100:.1f}%")
        print(f"Red (cells): {red_count/total*100:.1f}%")
        print(f"Black/Dark: {black_count/total*100:.1f}%")
        
        # If significant green, there's empty space
        if green_count / total > 0.15:
            print(f"\n⚠️ DETECTED: ~{green_count/total*100:.0f}% green space - likely excess padding/margin")
        
        print(f"\n{'='*50}")
        print("Analysis complete.")
        
        return True
        
    except ImportError:
        print("ERROR: Pillow library not installed.")
        print("Install it with: pip install Pillow")
        return False
    except FileNotFoundError:
        print(f"ERROR: File not found: {image_path}")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False


def get_clipboard_image():
    """Try to get image from clipboard and save it temporarily."""
    try:
        from PIL import ImageGrab
        import tempfile
        import os
        
        # Grab from clipboard
        img = ImageGrab.grabclipboard()
        
        if img is None:
            print("No image found in clipboard.")
            return None
        
        # Save to temp file
        temp_path = os.path.join(tempfile.gettempdir(), "clipboard_image.png")
        img.save(temp_path, "PNG")
        print(f"Clipboard image saved to: {temp_path}")
        return temp_path
        
    except ImportError:
        print("ERROR: Pillow library not installed.")
        return None
    except Exception as e:
        print(f"ERROR getting clipboard: {e}")
        return None


if __name__ == "__main__":
    print("\n" + "="*50)
    print("  IMAGE ANALYZER UTILITY")
    print("="*50)
    
    if len(sys.argv) > 1:
        # Image path provided as argument
        image_path = sys.argv[1]
        analyze_image(image_path)
    else:
        # Try clipboard
        print("\nNo image path provided. Checking clipboard...")
        clipboard_path = get_clipboard_image()
        if clipboard_path:
            analyze_image(clipboard_path)
        else:
            print("\nUsage:")
            print("  python image_analyzer.py <image_path>")
            print("  python image_analyzer.py  (reads from clipboard)")

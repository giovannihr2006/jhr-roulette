"""
Image Analyzer Utility (Enhanced with OCR)
Reads an image from the clipboard or a file path, displays metadata, and attempts to extract text.
"""
import sys
import os
from pathlib import Path

def analyze_image(image_path: str):
    """Analyze an image and print detailed information including OCR text."""
    try:
        from PIL import Image
        import pytesseract

        # Explicitly check for Tesseract path in common Windows locations if not in PATH
        # This is a hack because the user likely has it but not in environments
        possible_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            r"C:\Users\GIOVANNIHR\AppData\Local\Tesseract-OCR\tesseract.exe"
        ]

        for p in possible_paths:
            if os.path.exists(p):
                pytesseract.pytesseract.tesseract_cmd = p
                print(f"DEBUG: Found Tesseract binary at {p}")
                break

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

        # --- OCR SECTION ---
        print(f"\n{'='*50}")
        print("TEXT EXTRACTION (OCR):")
        print(f"{'='*50}")

        try:
            text = pytesseract.image_to_string(img)
            if text.strip():
                print("--- START OF TEXT ---")
                print(text.strip())
                print("--- END OF TEXT ---")
            else:
                print("No text detected (or text is empty).")
        except pytesseract.TesseractNotFoundError:
            print("ERROR: Tesseract OCR Engine not found.")
            print("Please ensure Tesseract-OCR is installed and in your PATH.")
            print("Download here: https://github.com/UB-Mannheim/tesseract/wiki")
        except Exception as e:
            print(f"OCR Failed: {e}")

        print(f"\n{'='*50}")
        print("Analysis complete.")

        return True

    except ImportError:
        print("ERROR: Required libraries (Pillow, pytesseract) not installed.")
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

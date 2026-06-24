import zipfile
import re
import sys
import os

def read_docx(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return

    try:
        with zipfile.ZipFile(file_path) as docx:
            # 1. List ALL files to check structure
            print("--- ALL FILES IN ZIP ---")
            all_files = docx.namelist()
            for f in all_files:
                print(f)
            print("------------------------")

            # 2. Extract text from ALL xml files that might contain text
            target_files = [f for f in all_files if f.endswith('.xml') and ('document' in f or 'header' in f or 'footer' in f)]

            for tf in target_files:
                print(f"\n=== ANALYZING {tf} ===")
                try:
                    content = docx.read(tf).decode('utf-8', errors='ignore')

                    # A. Search for Alt Text (descr)
                    alt_texts = re.findall(r'descr="([^"]*)"', content)
                    if alt_texts:
                        print(f"  [FOUND ALT TEXT]:")
                        for at in alt_texts:
                            print(f"  - {at}")

                    # B. Search for Titles
                    titles = re.findall(r'title="([^"]*)"', content)
                    if titles:
                        print(f"  [FOUND TITLE]:")
                        for t in titles:
                            print(f"  - {t}")

                    # C. Extract Text Content (w:t)
                    matches = re.findall(r'<w:t(?: [^>]*)?>(.*?)</w:t>', content)
                    if matches:
                        print("  [TEXT CONTENT]:")
                        print("  " + " ".join(matches))
                    else:
                        print("  (No text content found)")

                except Exception as e:
                    print(f"Error reading {tf}: {e}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python read_docx.py <file_path>")
    else:
        read_docx(sys.argv[1])

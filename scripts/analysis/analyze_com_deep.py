import pandas as pd

excel_path = 'RULETA 07032023.xlsx'

def analyze_com_sheet(path):
    print(f"--- Analyzing 'com' sheet in {path} ---")
    try:
        # Read without header initially to see raw structure
        df = pd.read_excel(path, sheet_name='com', header=None)
        print("Raw Data (First 50 rows):")
        print(df.to_string())

        # Also print a list of potential parameters found
        print("\nPossible Parameters detected:")
        for index, row in df.iterrows():
            if pd.notna(row[0]): # Assuming col 0 is parameter name
                print(f"{row[0]}: {row[1]}")

    except Exception as e:
        print(f"Error reading Excel: {e}")

if __name__ == "__main__":
    analyze_com_sheet(excel_path)

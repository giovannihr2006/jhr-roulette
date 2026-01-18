import pandas as pd

excel_path = 'RULETA 07032023.xlsx'

def analyze_ensayo_sheet(path):
    print(f"--- Analyzing 'ENSAYO' sheet in {path} ---")
    try:
        # Read a chunk to see structure
        df = pd.read_excel(path, sheet_name='ENSAYO', nrows=50) 
        print("Columns:", df.columns.tolist())
        print("First 20 rows:")
        print(df.head(20).to_string())
        
        # Check for formulas or specific headers that imply logic
        # Since we get values, we look for patterns like:
        # - Sequential numbers
        # - Reference to other sheets
        # - Conditional columns (TRUE/FALSE, 1/0)
        
    except Exception as e:
        print(f"Error reading Excel: {e}")
        # Try 'ENSAYO (2)' just in case
        try:
            print("\n--- Analyzing 'ENSAYO (2)' sheet ---")
            df2 = pd.read_excel(path, sheet_name='ENSAYO (2)', nrows=20)
            print(df2.to_string())
        except Exception as e2:
            print(e2)

if __name__ == "__main__":
    analyze_ensayo_sheet(excel_path)

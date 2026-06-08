import pandas as pd

excel_path = 'RULETA 07032023.xlsx'

def analyze_ensayo_deep(path):
    print(f"--- Deep Analyzing 'ENSAYO' sheet ---")
    try:
        # Read a larger chunk and look for non-null blocks
        df = pd.read_excel(path, sheet_name='ENSAYO', header=None, nrows=100)

        # Iterate to find the "Simulation" area.
        # It seems to have columns like "tiempo", "saldo", etc.
        print("Scanned Content:")
        for i, row in df.iterrows():
            # Print rows that have at least 3 non-null values to avoid empty spacers
            if row.count() > 3:
                print(f"Row {i}: {row.dropna().tolist()}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_ensayo_deep(excel_path)

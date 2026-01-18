import pandas as pd
from docx import Document
import os

excel_path = 'RULETA 07032023.xlsx'
docx_path = 'Roadmap de Evolución.docx'

def analyze_excel(path):
    print(f"--- Analyzing {path} ---")
    try:
        xl = pd.ExcelFile(path)
        print("Sheet names:", xl.sheet_names)
        
        # Analyze specific interesting sheets if they exist, or just the first few
        sheets_to_check = ['com', 'SALDO', 'Mejores planes', 'PROBABILIDAD', 'Hoja1', 'Sheet1']
        
        for sheet in xl.sheet_names:
            if sheet in sheets_to_check:
                print(f"\n[Sheet: {sheet}]")
                df = pd.read_excel(path, sheet_name=sheet, nrows=5)
                print(df.to_string())
                print("Columns:", df.columns.tolist())
    except Exception as e:
        print(f"Error reading Excel: {e}")

def analyze_docx(path):
    print(f"\n--- Analyzing {path} ---")
    try:
        doc = Document(path)
        print("Paragraphs (first 10 relevant):")
        count = 0
        for para in doc.paragraphs:
            if para.text.strip():
                print(f"- {para.text.strip()}")
                count += 1
                if count >= 10: break
    except Exception as e:
        print(f"Error reading Docx: {e}")

if __name__ == "__main__":
    if os.path.exists(excel_path):
        analyze_excel(excel_path)
    else:
        print(f"File not found: {excel_path}")
        
    if os.path.exists(docx_path):
        analyze_docx(docx_path)
    else:
        print(f"File not found: {docx_path}")

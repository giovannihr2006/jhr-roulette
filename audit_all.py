import pandas as pd
from docx import Document
import os

excel_path = 'RULETA 07032023.xlsx'
docx_path = 'Roadmap de Evolución.docx'

def audit_excel_full(path):
    print(f"=== FULL AUDIT: {path} ===")
    try:
        xl = pd.ExcelFile(path)
        all_sheets = xl.sheet_names
        print(f"Detected {len(all_sheets)} sheets: {all_sheets}")
        
        # Priority sheets we haven't fully analyzed yet
        priority_sheets = [
            'Mejores planes', 'SALDO', 'metodos', 'docenas', 
            'tiempos de espera', 'simulación consec F9', 'planes'
        ]
        
        for sheet in priority_sheets:
            if sheet in all_sheets:
                print(f"\n--- Analyzing Sheet: '{sheet}' ---")
                try:
                    df = pd.read_excel(path, sheet_name=sheet, nrows=20)
                    print(df.to_string())
                    # Detect logical structures
                    if 'plan' in df.columns.astype(str).str.lower().tolist() or df.astype(str).apply(lambda x: x.str.contains('plan', case=False)).any().any():
                        print(">> LOGIC DETECTED: Betting Plans / Progressions")
                    if 'saldo' in sheet.lower():
                        print(">> LOGIC DETECTED: Balance Tracking Logic")
                except Exception as e:
                    print(f"Could not read sheet {sheet}: {e}")

    except Exception as e:
        print(f"Critical Excel Error: {e}")

def audit_word_logic(path):
    print(f"\n=== LOGIC AUDIT: {path} ===")
    try:
        doc = Document(path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text.strip())
        
        print("\n".join(full_text[:30])) # Print first 30 paragraphs
        
        # Search for keywords implying complex logic
        keywords = ['algoritmo', 'configuración', 'defecto', 'usuario', 'patrón', 'variable']
        print("\n>> KEYWORD HITS:")
        for line in full_text:
            if any(k in line.lower() for k in keywords):
                print(f"   * {line}")

    except Exception as e:
        print(f"Word Error: {e}")

if __name__ == "__main__":
    audit_excel_full(excel_path)
    if os.path.exists(docx_path):
        audit_word_logic(docx_path)

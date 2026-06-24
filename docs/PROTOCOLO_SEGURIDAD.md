# 🛡️ PROTOCOLO DE SEGURIDAD FORENSE "CAJA NEGRA"
**Proyecto:** GHR Ruleta Royale

Este documento establece el protocolo obligatorio para garantizar la preservación absoluta del código fuente del proyecto.

---

## 🔒 1. LA BÓVEDA (SECURITY_VAULT)
Existe una carpeta blindada en la raíz del proyecto llamada `SECURITY_VAULT`.
*   Esta carpeta contiene los **Hitos (Milestones)** inmutables.
*   **NO** se debe borrar nada de esta carpeta manualmente.
*   Contiene un `manifest.json` que actúa como registro notarial de cada copia guardada.

## 📜 2. COPIAS SAGRADAS (HITOS)
Las copias críticas (como `GHR_RULETA_ROYAL_250120261238.zip`) se almacenan en `SECURITY_VAULT/Hitos`.
*   Estas copias tienen el atributo de **SOLO LECTURA** activado.
*   Están verificadas matemáticamente (SHA-256) para asegurar que no hay corrupción de datos.

## 🛠️ 3. HERRAMIENTA `forensic_guard.py`
Se ha creado un script especializado para gestionar la seguridad.

### Comandos Disponibles:
1.  **Asegurar un Archivo Externo:**
    Mueve un zip existente a la bóveda, lo verifica y lo bloquea.
    ```bash
    python forensic_guard.py secure <nombre_archivo.zip>
    ```

2.  **Crear Snapshot Rápido:**
    Crea una copia del estado actual del trabajo (sin node_modules) en la bóveda.
    ```bash
    python forensic_guard.py snapshot <etiqueta_opcional>
    ```

## 🚨 4. PROCEDIMIENTO DE RECUPERACIÓN (EMERGENCIA)
Si el proyecto se rompe catastróficamente:
1.  Ir a `SECURITY_VAULT/Hitos`.
2.  Copiar el archivo ZIP deseado a una carpeta segura fuera del proyecto.
3.  Descomprimir.
4.  (Opcional) Verificar el hash SHA-256 contra el `manifest.json`.

---
**ESTADO ACTUAL:** La copia `GHR_RULETA_ROYAL_250120261238.zip` está asegurada en la bóveda.

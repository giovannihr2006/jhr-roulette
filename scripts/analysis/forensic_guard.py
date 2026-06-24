import os
import shutil
import zipfile
import hashlib
import stat
import time
import json
import sys

VAULT_DIR = 'SECURITY_VAULT'
HITOS_DIR = os.path.join(VAULT_DIR, 'Hitos')
SNAPSHOTS_DIR = os.path.join(VAULT_DIR, 'Snapshots')
MANIFEST_FILE = os.path.join(VAULT_DIR, 'manifest.json')

def calculate_sha256(filepath):
    """Calculate SHA256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def ensure_vault():
    """Ensure the security vault directories exist."""
    os.makedirs(HITOS_DIR, exist_ok=True)
    os.makedirs(SNAPSHOTS_DIR, exist_ok=True)
    if not os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, 'w') as f:
            json.dump({"backups": []}, f)
    print(f"Vault secured at: {os.path.abspath(VAULT_DIR)}")

def log_backup(filename, path, backup_type, hash_val):
    """Log backup details to manifest."""
    entry = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "filename": filename,
        "path": path,
        "type": backup_type,
        "sha256": hash_val
    }

    data = {"backups": []}
    if os.path.exists(MANIFEST_FILE):
        try:
            with open(MANIFEST_FILE, 'r') as f:
                data = json.load(f)
        except:
            pass

    data["backups"].append(entry)

    with open(MANIFEST_FILE, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Logged to manifest: {filename}")

def lock_file(filepath):
    """Make file read-only."""
    os.chmod(filepath, stat.S_IREAD)
    print(f"LOCKED: {filepath} is now Read-Only.")

def verify_zip(filepath):
    """Verify zip integrity."""
    if not zipfile.is_zipfile(filepath):
        print(f"ERROR: {filepath} is not a valid zip file.")
        return False
    try:
        with zipfile.ZipFile(filepath, 'r') as zip_ref:
            bad_file = zip_ref.testzip()
            if bad_file:
                print(f"ERROR: Corrupt file in zip: {bad_file}")
                return False
        return True
    except Exception as e:
        print(f"ERROR: Zip verification failed: {e}")
        return False

def secure_external_backup(filepath, target_dir=HITOS_DIR):
    """Move an existing backup to the vault, verify, and lock it."""
    ensure_vault()
    if not os.path.exists(filepath):
        print(f"Error: File not found {filepath}")
        return

    filename = os.path.basename(filepath)
    target_path = os.path.join(target_dir, filename)

    print(f"Securing {filename}...")

    # 1. Copy/Move
    if os.path.abspath(filepath) != os.path.abspath(target_path):
        shutil.copy2(filepath, target_path)

    # 2. Verify
    if not verify_zip(target_path):
        print("CRITICAL: Backup integrity check failed! Aborting lock.")
        return

    # 3. Hash
    file_hash = calculate_sha256(target_path)
    print(f"Integrity Check PASSED. Hash: {file_hash}")

    # 4. Lock
    lock_file(target_path)

    # 5. Log
    log_backup(filename, target_path, "MILESTONE_IMPORT", file_hash)
    print("Backup successfully secured in vault.")

def create_snapshot(tag="snapshot"):
    """Create a new snapshot of the current workspace."""
    ensure_vault()
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"{tag}_{timestamp}.zip"
    target_path = os.path.join(SNAPSHOTS_DIR, filename)

    print(f"Creating snapshot {filename}...")

    try:
        with zipfile.ZipFile(target_path, 'w', zipfile.ZIP_DEFLATED) as z:
            for root, dirs, files in os.walk('.'):
                # Exclude Vault and heavy node_modules
                if VAULT_DIR in root or 'node_modules' in root or '.git' in root:
                    continue

                for file in files:
                    if file.endswith('.zip'): continue

                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, '.')
                    z.write(file_path, arcname)

        # Verify
        if not verify_zip(target_path):
            os.remove(target_path)
            return

        file_hash = calculate_sha256(target_path)
        log_backup(filename, target_path, "SNAPSHOT", file_hash)
        print(f"Snapshot created: {target_path}")

    except Exception as e:
        print(f"Snapshot creation failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "init":
            ensure_vault()
        elif cmd == "secure" and len(sys.argv) > 2:
            secure_external_backup(sys.argv[2])
        elif cmd == "snapshot":
            create_snapshot(sys.argv[2] if len(sys.argv) > 2 else "auto")
        else:
            print("Usage: python forensic_guard.py [init|secure <file>|snapshot <tag>]")
    else:
        print("Forensic Guard Ready.")

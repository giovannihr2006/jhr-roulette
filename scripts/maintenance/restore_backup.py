import zipfile
import os
import shutil

zip_path = 'GHR_RULETA_ROYAL_240120261928.zip'
print(f"Restoring from {zip_path}...")

try:
    with zipfile.ZipFile(zip_path, 'r') as z:
        for member in z.infolist():
            # Check if file is inside 'baryonic-blazar/'
            if member.filename.startswith('baryonic-blazar/'):
                # Strip 'baryonic-blazar/' prefix
                target_path = member.filename[len('baryonic-blazar/'):]

                # Skip if empty (root folder itself) or hidden system files/git
                if not target_path or target_path.startswith('.git/') or target_path.startswith('.github/'):
                    continue

                # Safety check: Prevent path traversal (though zipfile handles basic checks, good to be sure)
                if '..' in target_path:
                    print(f"Skipping potentially unsafe path: {target_path}")
                    continue

                # Prepare target path
                full_target_path = os.path.join('.', target_path)

                if member.is_dir():
                    os.makedirs(full_target_path, exist_ok=True)
                else:
                    # Create parent directory
                    os.makedirs(os.path.dirname(full_target_path), exist_ok=True)
                    # Extract file
                    with z.open(member) as source, open(full_target_path, 'wb') as target:
                        shutil.copyfileobj(source, target)
                    print(f"Restored: {target_path}")

    print("Restoration process completed successfully.")

except Exception as e:
    print(f"Error during restoration: {e}")

import { StorageError, type FileStorage, type StoredFile } from "@/lib/storage";

/**
 * Stockage en mémoire pour les tests : aucun appel à UploadThing.
 * `failUploadOf` fait échouer l'envoi d'un fichier donné ; `failRemove` fait échouer toute suppression.
 */
export function createMemoryStorage(options: { failUploadOf?: string; failRemove?: boolean } = {}) {
  const files = new Map<string, StoredFile>();
  let next = 0;

  const storage: FileStorage = {
    async upload(file) {
      if (file.name === options.failUploadOf) throw new StorageError(`Envoi de « ${file.name} » impossible`);
      next += 1;
      const key = `key-${next}_${file.name}`;
      const stored = { key, url: `https://test.ufs.sh/f/${key}`, name: file.name, size: file.size };
      files.set(key, stored);
      return stored;
    },
    async remove(keys) {
      if (options.failRemove) throw new StorageError(`Suppression de ${keys.join(", ")} impossible`);
      for (const key of keys) files.delete(key);
    },
  };

  return { storage, files };
}

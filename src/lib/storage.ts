import { UTApi } from "uploadthing/server";

import { getEnv } from "@/lib/env";

// Seul point de contact avec le stockage des fichiers (ADR 0006). C'est une interface vers un
// service externe, pas une couche d'accès aux données : les tests la remplacent par un faux.

/** Fichier stocké : la base ne garde que ces informations, jamais le contenu. */
export type StoredFile = { key: string; url: string; name: string; size: number };

export interface FileStorage {
  upload(file: File): Promise<StoredFile>;
  remove(keys: string[]): Promise<void>;
}

/** Échec du service de stockage (réseau, service indisponible, clé invalide…). */
export class StorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "StorageError";
  }
}

/** Ce que l'adaptateur utilise de `UTApi` (uploadthing 7). */
export type UploadThingClient = {
  uploadFiles(file: File): Promise<{
    data: { key: string; ufsUrl: string; name: string; size: number } | null;
    error: { message: string } | null;
  }>;
  deleteFiles(keys: string[]): Promise<{ success: boolean }>;
};

export function createUploadThingStorage(client: UploadThingClient): FileStorage {
  return {
    async upload(file) {
      const result = await client.uploadFiles(file).catch((cause: unknown) => {
        throw new StorageError(`Envoi de « ${file.name} » impossible`, { cause });
      });
      if (!result.data) {
        throw new StorageError(`Envoi de « ${file.name} » refusé : ${result.error?.message}`);
      }
      const { key, ufsUrl, name, size } = result.data;
      return { key, url: ufsUrl, name, size };
    },
    async remove(keys) {
      const result = await client.deleteFiles(keys).catch((cause: unknown) => {
        throw new StorageError(`Suppression de ${keys.join(", ")} impossible`, { cause });
      });
      if (!result.success) throw new StorageError(`Suppression de ${keys.join(", ")} refusée`);
    },
  };
}

let cached: FileStorage | undefined;

/** Stockage de production (UploadThing), créé au premier usage. */
export function getStorage(): FileStorage {
  cached ??= createUploadThingStorage(new UTApi({ token: getEnv().UPLOADTHING_TOKEN }));
  return cached;
}

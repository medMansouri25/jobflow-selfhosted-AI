import { describe, expect, it } from "vitest";

import { createUploadThingStorage, StorageError, type UploadThingClient } from "@/lib/storage";

const pdf = new File(["%PDF-1.7"], "CV_DevOps.pdf", { type: "application/pdf" });

// Faux client UploadThing : mêmes réponses que `UTApi` (uploadthing 7), sans réseau.
type UploadResult = Awaited<ReturnType<UploadThingClient["uploadFiles"]>>;
type DeleteResult = Awaited<ReturnType<UploadThingClient["deleteFiles"]>>;

function fakeUtapi(overrides: { upload?: UploadResult; delete?: DeleteResult } = {}) {
  const deleted: string[][] = [];
  const client: UploadThingClient = {
      uploadFiles: async (file: File) =>
        overrides.upload ?? {
          data: { key: "abc_CV_DevOps.pdf", ufsUrl: "https://app.ufs.sh/f/abc_CV_DevOps.pdf", name: file.name, size: 240_000 },
          error: null,
        },
      deleteFiles: async (keys: string[]) => {
        deleted.push(keys);
        return overrides.delete ?? { success: true };
      },
  };
  return { deleted, client };
}

describe("stockage des pièces jointes (UploadThing)", () => {
  it("renvoie la clé, l'URL, le nom et la taille du fichier envoyé", async () => {
    const storage = createUploadThingStorage(fakeUtapi().client);

    expect(await storage.upload(pdf)).toEqual({
      key: "abc_CV_DevOps.pdf",
      url: "https://app.ufs.sh/f/abc_CV_DevOps.pdf",
      name: "CV_DevOps.pdf",
      size: 240_000,
    });
  });

  it("lève une StorageError quand UploadThing refuse l'envoi", async () => {
    const storage = createUploadThingStorage(
      fakeUtapi({ upload: { data: null, error: { message: "boom" } } }).client,
    );

    await expect(storage.upload(pdf)).rejects.toThrow(StorageError);
  });

  it("supprime les fichiers par leur clé", async () => {
    const fake = fakeUtapi();
    const storage = createUploadThingStorage(fake.client);

    await storage.remove(["k1", "k2"]);

    expect(fake.deleted).toEqual([["k1", "k2"]]);
  });

  it("lève une StorageError quand la suppression échoue", async () => {
    const storage = createUploadThingStorage(
      fakeUtapi({ delete: { success: false } }).client,
    );

    await expect(storage.remove(["k1"])).rejects.toThrow(StorageError);
  });
});

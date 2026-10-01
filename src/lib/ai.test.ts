import { describe, expect, it, vi } from "vitest";

import { AiError, createGeminiGenerator } from "@/lib/ai";

function reply(status: number, body: unknown) {
  return vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

const REQUEST = { system: "Tu rédiges des lettres.", prompt: "Écris la lettre." };

describe("générateur Gemini", () => {
  it("envoie la consigne système et la demande, avec la clé en en-tête (jamais dans l'adresse)", async () => {
    const fetch = reply(200, { candidates: [{ content: { parts: [{ text: "Madame, " }, { text: "Monsieur," }] } }] });
    const generator = createGeminiGenerator({ apiKey: "cle-secrete", model: "gemini-test", fetch });

    expect(await generator.generate(REQUEST)).toBe("Madame, Monsieur,");

    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent",
    );
    expect(String(url)).not.toContain("cle-secrete");
    expect(new Headers(init?.headers).get("x-goog-api-key")).toBe("cle-secrete");
    const body = JSON.parse(String(init?.body));
    expect(body.systemInstruction.parts[0].text).toBe("Tu rédiges des lettres.");
    expect(body.contents[0].parts[0].text).toBe("Écris la lettre.");
  });

  it("AC-008-07 dit que la limite gratuite est atteinte (429)", async () => {
    const generator = createGeminiGenerator({ apiKey: "k", model: "m", fetch: reply(429, {}) });

    await expect(generator.generate(REQUEST)).rejects.toThrow(/limite/i);
  });

  it("AC-008-07 transforme une erreur du service ou du réseau en message, sans détail technique", async () => {
    const failing = createGeminiGenerator({ apiKey: "k", model: "m", fetch: reply(500, { error: "boom" }) });
    const offline = createGeminiGenerator({
      apiKey: "k",
      model: "m",
      fetch: vi.fn<typeof fetch>().mockRejectedValue(new TypeError("fetch failed")),
    });

    await expect(failing.generate(REQUEST)).rejects.toBeInstanceOf(AiError);
    await expect(offline.generate(REQUEST)).rejects.toThrow(/ne répond pas/);
  });

  it("refuse une réponse sans texte (contenu bloqué)", async () => {
    const generator = createGeminiGenerator({
      apiKey: "k",
      model: "m",
      fetch: reply(200, { candidates: [{ finishReason: "SAFETY" }] }),
    });

    await expect(generator.generate(REQUEST)).rejects.toThrow(/aucun texte/);
  });

  it("BR-008-07 passe au modèle de secours quand le modèle principal est surchargé (503)", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Lettre" }] } }] }), { status: 200 }),
      );
    const generator = createGeminiGenerator({ apiKey: "k", model: "principal", fallbackModel: "secours", fetch });

    expect(await generator.generate(REQUEST)).toBe("Lettre");
    expect(fetch.mock.calls.map(([url]) => String(url).match(/models\/(.+):/)?.[1])).toEqual(["principal", "secours"]);
  });

  it("dit que le service est surchargé si le secours l'est aussi", async () => {
    const generator = createGeminiGenerator({ apiKey: "k", model: "principal", fallbackModel: "secours", fetch: reply(503, {}) });

    await expect(generator.generate(REQUEST)).rejects.toThrow(/surchargé/);
  });
});

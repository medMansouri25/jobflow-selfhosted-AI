import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sans `globals`, Testing Library ne vide pas le DOM entre deux tests : on le fait explicitement.
afterEach(() => {
  cleanup();
});

import { execSync } from "node:child_process";

// Une fois avant la suite d'intégration : applique les migrations sur la base de test.
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error("TEST_DATABASE_URL manque : copie .env.example en .env");
  }
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}

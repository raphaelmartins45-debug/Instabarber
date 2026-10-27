import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  // Cria as barbearias e os papéis de teste quando há Supabase local (scripts/e2e-local.sh).
  globalSetup: "./e2e/semear.ts",
  // O browser fica na hora de Lisboa, como os clientes: os dias da agenda não mudam à meia-noite UTC.
  // Utilizadores em Portugal: língua portuguesa por omissão (a multilinguagem lê o dispositivo).
  use: { baseURL: "http://localhost:3000", timezoneId: "Europe/Lisbon", locale: "pt-PT" },
  projects: [
    { name: "computador", use: { ...devices["Desktop Chrome"] } },
    { name: "telemovel", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: true },
});

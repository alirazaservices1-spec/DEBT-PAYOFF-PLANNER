#!/usr/bin/env node
/**
 * Uses Expo's built-in --tunnel flag (ngrok/expo-go tunnel).
 * Passes all Expo output through unmodified, then generates a QR image
 * once the tunnel URL appears in the output.
 */
const { spawn } = require("child_process");
const QRCode    = require("qrcode");
const path      = require("path");

const PORT    = 8081;
const QR_FILE = path.join(__dirname, "..", "client-qr.png");

async function main() {
  console.log("\x1b[33mStarting Expo with built-in tunnel…\x1b[0m\n");

  const expo = spawn(
    "npx",
    ["expo", "start", "--tunnel", "--port", String(PORT)],
    { env: { ...process.env }, stdio: "inherit" }
  );

  // Poll the Metro manifest endpoint every 3 s to extract the tunnel URL
  // once Expo has set it up internally.
  let saved = false;
  const poll = setInterval(async () => {
    try {
      const http = require("http");
      await new Promise((resolve, reject) => {
        const req = http.get("http://localhost:8081/_expo/manifest", {
          headers: { Accept: "application/expo+json,application/json" },
          timeout: 2000,
        }, (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", async () => {
            try {
              const json = JSON.parse(data);
              // bundleUrl or hostUri contains the tunnel host
              const hostUri = json.hostUri || "";
              if (hostUri && !saved) {
                saved = true;
                clearInterval(poll);
                // hostUri looks like "abc.exp.direct:80" — build exps:// URL
                const host = hostUri.replace(/:80$/, "");
                const expoUrl = `exps://${host}`;

                console.log("\n\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m");
                console.log(`\x1b[1m\x1b[36m  Tunnel URL: ${expoUrl}\x1b[0m`);
                console.log("\x1b[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n");

                await QRCode.toFile(QR_FILE, expoUrl, {
                  width: 800, margin: 4,
                  errorCorrectionLevel: "H",
                  color: { dark: "#000000", light: "#FFFFFF" },
                });
                console.log(`\x1b[32m  QR image saved → client-qr.png\x1b[0m\n`);
              }
            } catch (_) {}
            resolve();
          });
        });
        req.on("error", reject);
        req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
      });
    } catch (_) {}
  }, 3000);

  const cleanup = () => { clearInterval(poll); expo.kill(); };
  expo.on("exit", (code) => { cleanup(); process.exit(code ?? 1); });
  process.on("SIGINT",  () => { cleanup(); process.exit(0); });
  process.on("SIGTERM", () => { cleanup(); process.exit(0); });
}

main().catch((e) => { console.error(e.message); process.exit(1); });

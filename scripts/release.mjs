import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const pkgPath = path.join(rootDir, "package.json");

if (!fs.existsSync(pkgPath)) {
  console.error("❌ Error: package.json not found in current directory.");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version;
console.log(`\n🚀 [VoiceFlow Release] Preparing Release v${version}...\n`);

// 1. Locate and load private signing key
const keyCandidates = [
  path.join(rootDir, "apps", "desktop", "voiceflow-signing.key"),
  path.join(rootDir, "voiceflow-signing.key"),
  path.join(rootDir, ".tauri-keys", "voiceflow.key"),
];

let signingKey = process.env.TAURI_SIGNING_PRIVATE_KEY;

if (!signingKey) {
  for (const candidate of keyCandidates) {
    if (fs.existsSync(candidate)) {
      console.log(`🔑 Found signing key: ${candidate}`);
      signingKey = fs.readFileSync(candidate, "utf8").trim();
      break;
    }
  }
}

if (!signingKey) {
  console.warn(
    "⚠️ Warning: No signing key found. Builds will not be cryptographically signed for auto-updates.",
  );
} else {
  console.log("🔒 Signing key loaded successfully.");
}

// 2. Prepare standalone bundled backend and binaries in resources/
console.log("\n📦 Bundling standalone backend and copying runtime binaries...");
const resourcesDir = path.join(
  rootDir,
  "apps",
  "desktop",
  "src-tauri",
  "resources",
);
const resourcesBin = path.join(resourcesDir, "bin");
const resourcesServer = path.join(resourcesDir, "server");

fs.mkdirSync(resourcesBin, { recursive: true });
fs.mkdirSync(resourcesServer, { recursive: true });

// Copy all binaries (portable node.exe, whisper-cli.exe, ggml DLLs)
const binDir = path.join(rootDir, "bin");
if (fs.existsSync(binDir)) {
  for (const file of fs.readdirSync(binDir)) {
    fs.copyFileSync(path.join(binDir, file), path.join(resourcesBin, file));
  }
  console.log("   ✓ Runtime binaries synced to resources/bin/");
}

// Build monorepo desktop and api packages
console.log("\n⚙️ Compiling desktop & API packages...");
execSync("pnpm turbo run build --filter=!@voiceflow/web", { stdio: "inherit" });

// Bundle NestJS server with all dependencies into self-contained ESM bundle
console.log("\n⚡ Bundling NestJS backend with @vercel/ncc...");
execSync(
  `pnpm dlx @vercel/ncc build apps/api/dist/main.js -o "${resourcesServer}" -m`,
  {
    stdio: "inherit",
  },
);
console.log("   ✓ NestJS backend bundled cleanly into resources/server/");

// 3. Build and package signed Tauri desktop bundle
console.log("\n🚀 Building signed Tauri desktop application installer...");
try {
  execSync("pnpm --filter @voiceflow/desktop tauri build --bundles nsis", {
    stdio: "inherit",
    env: {
      ...process.env,
      ...(signingKey
        ? {
            TAURI_SIGNING_PRIVATE_KEY: signingKey,
            TAURI_SIGNING_PRIVATE_KEY_PASSWORD:
              process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD ?? "",
          }
        : {}),
    },
  });
} catch (err) {
  console.error("❌ Tauri build failed:", err);
  process.exit(1);
}

// 3. Stage release artifacts
const nsisDir = path.join(
  rootDir,
  "apps",
  "desktop",
  "src-tauri",
  "target",
  "release",
  "bundle",
  "nsis",
);

const releaseDir = path.join(rootDir, "release");
fs.mkdirSync(releaseDir, { recursive: true });

console.log("\n📂 Staging release artifacts to ./release/...");

const filesToCopy = [
  `VoiceFlow_${version}_x64-setup.exe`,
  `VoiceFlow_${version}_x64-setup.exe.sig`,
  `VoiceFlow_${version}_x64.nsis.zip`,
  `VoiceFlow_${version}_x64.nsis.zip.sig`,
];

const copied = [];

for (const file of filesToCopy) {
  const src = path.join(nsisDir, file);
  if (fs.existsSync(src)) {
    const dest = path.join(releaseDir, file);
    fs.copyFileSync(src, dest);
    const stats = fs.statSync(dest);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   ✓ ${file} (${sizeMb} MB)`);
    copied.push(file);
  }
}

// Generate updater manifest latest.json
const sigPath = path.join(releaseDir, `VoiceFlow_${version}_x64-setup.exe.sig`);
if (fs.existsSync(sigPath)) {
  const signature = fs.readFileSync(sigPath, "utf-8").trim();
  const manifest = {
    version: version,
    notes: `VoiceFlow Release v${version} - Standalone engine bundle with zero external prerequisites.`,
    pub_date: new Date().toISOString(),
    platforms: {
      "windows-x86_64": {
        signature: signature,
        url: `https://github.com/Utpal4505/voiceflow-releases/releases/download/v${version}/VoiceFlow_${version}_x64-setup.exe`,
      },
    },
  };
  fs.writeFileSync(
    path.join(releaseDir, "latest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8",
  );
  console.log(`   ✓ latest.json (Auto-updater manifest)`);
}

// Create convenience .zip of installer and generic VoiceFlow-Setup.exe
const setupExe = path.join(releaseDir, `VoiceFlow_${version}_x64-setup.exe`);
const genericExe = path.join(releaseDir, "VoiceFlow-Setup.exe");
const setupZip = path.join(releaseDir, `VoiceFlow_${version}_x64-setup.zip`);

if (fs.existsSync(setupExe)) {
  fs.copyFileSync(setupExe, genericExe);
  console.log(`   ✓ VoiceFlow-Setup.exe (Direct permanent link asset)`);

  try {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${setupExe}' -DestinationPath '${setupZip}' -Force"`,
      { stdio: "ignore" },
    );
    console.log(
      `   ✓ VoiceFlow_${version}_x64-setup.zip (Compressed setup archive)`,
    );
  } catch {}
}

console.log("\n🎉 Release v" + version + " packaging complete!");
console.log(`📁 Files staged at: ${releaseDir}\n`);

// 4. Open Explorer
try {
  execSync(`explorer.exe "${releaseDir}"`, { stdio: "ignore" });
} catch {}

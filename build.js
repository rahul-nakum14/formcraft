import { execSync } from "child_process"
import fs from "fs"

console.log("🏗️  Building FormCraft...")

// Clean previous builds
if (fs.existsSync("dist")) {
  fs.rmSync("dist", { recursive: true, force: true })
}

try {
  // Build client
  console.log("📦 Building client...")
  execSync("vite build", { stdio: "inherit" })

  // Build server
  console.log("🔧 Building server...")
  execSync(
    "tsc server/index.ts --outDir dist --target es2022 --module esnext --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop --skipLibCheck",
    { stdio: "inherit" },
  )

  console.log("✅ Build completed successfully!")
} catch (error) {
  console.error("❌ Build failed:", error.message)
  process.exit(1)
}

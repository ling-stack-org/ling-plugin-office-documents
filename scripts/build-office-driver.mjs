import { cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const platform = process.argv.find((arg) => arg.startsWith("--platform="))?.slice(11) ?? (process.platform === "darwin" ? "darwin-arm64" : process.platform === "win32" ? "win32-x64" : "unsupported");
const out = resolve(root, "dist/office-driver");
if (platform === "darwin-arm64") {
  const bundle = resolve(out, platform, "OfficeDriver.app"); const executable = resolve(bundle, "Contents/MacOS/ling-office-driver");
  await rm(bundle, { recursive: true, force: true }); await mkdir(dirname(executable), { recursive: true }); await mkdir(resolve(bundle, "Contents/Resources"), { recursive: true });
  await run("xcrun", ["swiftc", "-O", "-parse-as-library", resolve(root, "native/office-driver/macos/main.swift"), "-framework", "AppKit", "-framework", "CoreServices", "-o", executable]);
  await cp(resolve(root, "native/office-driver/macos/Info.plist"), resolve(bundle, "Contents/Info.plist"));
  await run("codesign", ["--force", "--sign", "-", "--options", "runtime", "--entitlements", resolve(root, "native/office-driver/macos/entitlements.plist"), bundle]);
} else if (platform === "win32-x64") {
  const output = resolve(out, platform); await rm(output, { recursive: true, force: true }); await mkdir(output, { recursive: true });
  await run("dotnet", ["publish", resolve(root, "native/office-driver/windows/Ling.Office.Driver.csproj"), "--configuration", "Release", "--runtime", "win-x64", "--self-contained", "true", "/p:PublishSingleFile=true", "/p:IncludeNativeLibrariesForSelfExtract=true", "--output", output]);
} else throw new Error(`Unsupported Office driver platform: ${platform}`);
function run(command, args) { return new Promise((resolveRun, reject) => { const child = spawn(command, args, { cwd: root, stdio: "inherit" }); child.once("error", reject); child.once("exit", (code) => code === 0 ? resolveRun() : reject(new Error(`${command} exited with ${code}`))); }); }

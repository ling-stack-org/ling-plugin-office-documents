import { copyFile, cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [platform, arch] = process.argv.slice(2);
const target = platform === "darwin" && arch === "arm64"
  ? "darwin-arm64/OfficeDriver.app"
  : platform === "win32" && arch === "x64" ? "win32-x64/ling-office-driver.exe" : undefined;
if (!target || process.platform !== platform || process.arch !== arch) {
  throw new Error("Build the Office driver on its target platform and architecture.");
}

const staging = await mkdtemp(resolve(tmpdir(), "ling-office-plugin-"));
try {
  await mkdir(resolve(staging, ".ling-plugin"));
  for (const name of [".ling-plugin/plugin.json", "mcp-server.json", "LICENSE"]) {
    await copyFile(resolve(root, name), resolve(staging, name));
  }
  const destination = resolve(staging, "runtime/office-driver", target);
  await mkdir(dirname(destination), { recursive: true });
  await cp(resolve(root, "dist/office-driver", target), destination, { recursive: true });
  const executable = platform === "darwin"
    ? resolve(destination, "Contents/MacOS/ling-office-driver")
    : destination;
  execFileSync(process.execPath, [resolve(root, "scripts/smoke-driver.mjs"), executable], { stdio: "inherit" });
  if (platform === "darwin") {
    execFileSync("/usr/bin/codesign", ["--verify", "--deep", "--strict", destination], { stdio: "inherit" });
  }
  execFileSync(process.execPath, [
    resolve(root, "scripts/package-plugin.mjs"),
    "--root", staging,
    "--output", resolve(root, "dist/packages"),
    "--platform", platform,
    "--arch", arch,
    "--channel", "dev",
    "--repository", "ling-stack-org/ling-plugin-office-documents",
    "--releaseTag", process.env.LING_PLUGIN_RELEASE_TAG ?? "local-dev",
    "--sourceSha", process.env.GITHUB_SHA ?? "local",
  ], { stdio: "inherit" });
} finally {
  await rm(staging, { recursive: true, force: true });
}

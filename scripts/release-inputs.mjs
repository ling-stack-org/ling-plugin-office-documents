import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export async function releaseInputs(root) {
  const explicitTag = process.env.LING_PLUGIN_RELEASE_TAG;
  if (!explicitTag || explicitTag === "local-dev") {
    return { tag: "local-dev", channel: "dev", sourceSha: process.env.GITHUB_SHA ?? "local" };
  }
  const manifest = JSON.parse(await readFile(join(root, ".ling-plugin/plugin.json"), "utf8"));
  if (!/^v\d+\.\d+\.\d+$/u.test(explicitTag) || explicitTag !== `v${manifest.version}`) {
    throw new Error("Release tag must match the stable plugin manifest version.");
  }
  const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const sourceSha = git(["rev-parse", "HEAD"]);
  if (git(["status", "--porcelain", "--untracked-files=no"])
    || process.env.GITHUB_SHA && process.env.GITHUB_SHA !== sourceSha) {
    throw new Error("Release packaging requires the selected clean source commit.");
  }
  return { tag: explicitTag, channel: "stable", sourceSha };
}

export function verifyNativeReleaseSignature(path, platform) {
  if (platform === "darwin") {
    const team = process.env.LING_PLUGIN_DARWIN_TEAM_ID;
    if (!/^[A-Z0-9]{10}$/u.test(team ?? "")) throw new Error("Release Team ID is required.");
    execFileSync("/usr/bin/codesign", ["--verify", "--deep", "--strict", "--all-architectures",
      `-R=anchor apple generic and certificate leaf[subject.OU] = "${team}" and certificate leaf[field.1.2.840.113635.100.6.1.13] exists`,
      path], { stdio: "inherit", timeout: 30_000 });
    return;
  }
  const expected = process.env.LING_PLUGIN_WINDOWS_SIGNER_SHA256;
  if (!/^[a-f0-9]{64}$/u.test(expected ?? "")) throw new Error("Release certificate SHA-256 is required.");
  const actual = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", [
    "$ErrorActionPreference = 'Stop'",
    "$signature = Get-AuthenticodeSignature -LiteralPath $env:LING_PLUGIN_RELEASE_VERIFY_PATH",
    "if ($signature.Status -ne 'Valid' -or !$signature.SignerCertificate -or !$signature.TimeStamperCertificate) { exit 1 }",
    "$digest = [System.Security.Cryptography.SHA256]::Create().ComputeHash($signature.SignerCertificate.RawData)",
    "[BitConverter]::ToString($digest).Replace('-', '').ToLowerInvariant()",
  ].join("\n")], { env: { ...process.env, LING_PLUGIN_RELEASE_VERIFY_PATH: path },
    encoding: "utf8", timeout: 30_000, maxBuffer: 64 * 1024 }).trim();
  if (actual !== expected) throw new Error("The native file's release signer does not match the reviewed certificate.");
}

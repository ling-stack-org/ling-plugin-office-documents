import { cp, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
const root = resolve(import.meta.dirname, ".."); const platform = process.argv.find((arg) => arg.startsWith("--platform="))?.slice(11); const arch = process.argv.find((arg) => arg.startsWith("--arch="))?.slice(7);
if (!platform || !arch) throw new Error("stage_runtime_platform_required");
const staged = resolve(root, ".ling-plugin-runtime"); await rm(staged, { recursive: true, force: true }); await mkdir(join(staged, ".ling-plugin"), { recursive: true });
for (const file of [".ling-plugin/plugin.json", "README.md", "mcp-server.json"]) await cp(resolve(root, file), join(staged, file));
const source = platform === "darwin" ? resolve(root, "dist/office-driver/darwin-arm64/OfficeDriver.app") : resolve(root, "dist/office-driver/win32-x64/ling-office-driver.exe");
const target = platform === "darwin" ? resolve(staged, "runtime/office-driver/darwin-arm64/OfficeDriver.app") : resolve(staged, "runtime/office-driver/win32-x64/ling-office-driver.exe");
await mkdir(resolve(target, ".."), { recursive: true }); await cp(source, target, { recursive: true });

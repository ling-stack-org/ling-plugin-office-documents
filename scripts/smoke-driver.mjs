import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const executable = resolve(process.argv[2]);
const request = Buffer.from(JSON.stringify({
  protocol: "ling.office.driver.v1",
  id: "driver-smoke",
  method: "driver_status",
  params: {},
  deadlineAt: new Date(Date.now() + 20_000).toISOString(),
  idempotencyKey: "office-driver-build-smoke",
}));
const length = Buffer.alloc(4);
length.writeUInt32LE(request.length);
const result = execFileSync(executable, [], {
  input: Buffer.concat([length, request]),
  env: { ...process.env, LING_OFFICE_PARENT_PID: String(process.pid) },
  timeout: 25_000,
  maxBuffer: 64 * 1024,
});
if (result.length < 4 || result.readUInt32LE() !== result.length - 4) {
  throw new Error("Office helper returned an invalid status frame.");
}
const response = JSON.parse(result.subarray(4).toString("utf8"));
if (response.id !== "driver-smoke" || response.protocol !== "ling.office.driver.v1"
  || response.ok !== true || typeof response.result?.helperVersion !== "string") {
  throw new Error("Office helper did not return a successful status result.");
}
console.log("Office driver " + response.result.helperVersion + " responded to driver_status.");

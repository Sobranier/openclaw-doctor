import { exec } from "node:child_process";
import { promisify } from "node:util";
const execAsync = promisify(exec);
import { log, addRestartRecord } from "./logger.js";
import {
  type OpenClawInfo,
  getRestartCommand,
  getStartCommand,
  getStopCommand,
} from "./openclaw.js";

export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
}

async function runShell(command: string): Promise<CommandResult> {
  try {
    const { stdout } = await execAsync(command, { timeout: 120_000 });
    return { success: true, output: stdout.trim() };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { success: false, error };
  }
}

export async function restartGateway(info: OpenClawInfo): Promise<CommandResult> {
  const cmd = getRestartCommand(info);
  log("warn", `Restarting gateway: ${cmd}`);

  const result = await runShell(cmd);

  if (result.success) {
    log("success", "Gateway restarted");
  } else {
    log("error", `Gateway restart failed: ${result.error}`);
  }

  addRestartRecord({
    timestamp: new Date().toISOString(),
    reason: "health check failed",
    success: result.success,
  });

  return result;
}

export async function startGateway(info: OpenClawInfo): Promise<CommandResult> {
  const cmd = getStartCommand(info);
  log("info", `Starting gateway: ${cmd}`);
  const result = await runShell(cmd);
  if (result.success) log("success", "Gateway started");
  else log("error", `Gateway start failed: ${result.error}`);
  return result;
}

export async function stopGateway(info: OpenClawInfo): Promise<CommandResult> {
  const cmd = getStopCommand(info);
  log("info", `Stopping gateway: ${cmd}`);
  const result = await runShell(cmd);
  if (result.success) log("success", "Gateway stopped");
  else log("error", `Gateway stop failed: ${result.error}`);
  return result;
}

export class RestartThrottle {
  private timestamps: number[] = [];

  constructor(private maxPerHour: number) {}

  canRestart(): boolean {
    const oneHourAgo = Date.now() - 3600_000;
    this.timestamps = this.timestamps.filter((t) => t > oneHourAgo);
    return this.timestamps.length < this.maxPerHour;
  }

  record() {
    this.timestamps.push(Date.now());
  }

  recentCount(): number {
    const oneHourAgo = Date.now() - 3600_000;
    return this.timestamps.filter((t) => t > oneHourAgo).length;
  }
}

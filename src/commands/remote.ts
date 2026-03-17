import chalk from "chalk";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { randomUUID } from "node:crypto";
import { DOCTOR_HOME } from "../config.js";

const REMOTE_API_URL = "https://api.openclaw-cli.app";
const REMOTE_CONFIG_FILE = join(DOCTOR_HOME, "remote.json");

interface RemoteConfig {
  enabled: boolean;
  machineId: string;
  machineToken: string;
  reportUrl: string;
  lastReport: string | null;
}

function loadRemoteConfig(): RemoteConfig {
  try {
    if (existsSync(REMOTE_CONFIG_FILE)) {
      return JSON.parse(readFileSync(REMOTE_CONFIG_FILE, "utf-8"));
    }
  } catch {}
  return {
    enabled: false,
    machineId: randomUUID(),
    machineToken: "",
    reportUrl: REMOTE_API_URL + "/v1/report",
    lastReport: null,
  };
}

function saveRemoteConfig(config: RemoteConfig): void {
  const dir = join(REMOTE_CONFIG_FILE, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(REMOTE_CONFIG_FILE, JSON.stringify(config, null, 2));
}

function askLine(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function remoteLogin(_options: {
  config?: string;
  profile?: string;
}) {
  const config = loadRemoteConfig();

  console.log(chalk.cyan.bold("\n  Remote Monitoring Login\n"));
  console.log(chalk.gray("  Steps:"));
  console.log(chalk.gray("  1. Go to https://openclaw-cli.app/remote"));
  console.log(chalk.gray("  2. Sign in with your account"));
  console.log(chalk.gray("  3. Copy the ID token shown on the page"));
  console.log();

  const idToken = await askLine(chalk.yellow("  Paste your ID token: "));
  if (!idToken) {
    console.log(chalk.red("  No token provided. Aborted."));
    return;
  }

  console.log(chalk.gray("\n  Registering this machine..."));

  try {
    const hostname = (await import("node:os")).hostname();
    const os = process.platform + "/" + process.arch;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(REMOTE_API_URL + "/v1/machines/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + idToken,
      },
      body: JSON.stringify({ hostname, os, version: "unknown" }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.text();
      console.log(chalk.red(`  Registration failed: ${res.status} ${err}`));
      return;
    }

    const data = (await res.json()) as {
      machineId: string;
      machineToken: string;
    };

    config.machineId = data.machineId;
    config.machineToken = data.machineToken;
    config.enabled = true;
    config.reportUrl = REMOTE_API_URL + "/v1/report";
    saveRemoteConfig(config);

    console.log(chalk.green.bold("\n  Registered successfully!"));
    console.log(chalk.gray(`  Machine ID: ${data.machineId}`));
    console.log(
      chalk.gray("  Remote reporting is now enabled.\n"),
    );
  } catch (err) {
    console.log(chalk.red(`  Error: ${err}`));
  }
}

export async function remoteEnable(_options: {
  config?: string;
  profile?: string;
}) {
  const config = loadRemoteConfig();
  if (!config.machineToken) {
    console.log(
      chalk.red("  ✗ Not logged in. Run: openclaw-cli remote login"),
    );
    return;
  }
  config.enabled = true;
  saveRemoteConfig(config);
  console.log(chalk.green("  Remote reporting enabled."));
}

export async function remoteDisable(_options: {
  config?: string;
  profile?: string;
}) {
  const config = loadRemoteConfig();
  config.enabled = false;
  saveRemoteConfig(config);
  console.log(chalk.yellow("  Remote reporting disabled."));
}

export async function remoteStatus(_options: {
  config?: string;
  profile?: string;
}) {
  const config = loadRemoteConfig();

  console.log(chalk.cyan.bold("\n  Remote Monitoring Status\n"));
  console.log(
    `  Enabled:       ${config.enabled ? chalk.green("yes") : chalk.gray("no")}`,
  );
  console.log(
    `  Machine ID:    ${chalk.white(config.machineId || "(none)")}`,
  );
  console.log(
    `  Token:         ${config.machineToken ? chalk.green("configured") : chalk.red("not set")}`,
  );
  console.log(
    `  Report URL:    ${chalk.gray(config.reportUrl)}`,
  );
  console.log(
    `  Last Report:   ${config.lastReport ? chalk.gray(config.lastReport) : chalk.gray("never")}`,
  );
  console.log();
}

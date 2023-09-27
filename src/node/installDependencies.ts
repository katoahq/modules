import { StepFn, StepOptions } from "https://deno.land/x/katoa/mod.ts";
import { hasCommand } from "../install/utils.ts";

/**
 * Installs package.json dependencies using pnpm, yarn or npm (in that order).
 */
export function installDependencies(): StepOptions {
  const installScript: StepFn = async () => {
    const hasPnpm = await hasCommand("pnpm");
    const hasYarn = await hasCommand("yarn");
    const command = hasPnpm
      ? "pnpm install"
      : hasYarn
      ? "yarn install"
      : "npm install";

    console.log(`Running: ${command}`);
    const p = Deno.run({ cmd: command.split(" ") });
    const status = await p.status();
    p.close();

    if (!status.success) {
      throw new Error(`Failed to install dependencies with '${command}'.`);
    }
  };

  return {
    name: "Install Node Dependencies",
    run: installScript,
  };
}

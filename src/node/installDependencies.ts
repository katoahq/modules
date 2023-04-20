import { StepFn, StepOptions } from "https://deno.land/x/cicada/mod.ts";
import { hasCommand } from "./utils.ts";

/**
 * Installs npm dependencies using pnpm, yarn or npm (in order of preference).
 * @returns StepOptions - A valid Cicada step.
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

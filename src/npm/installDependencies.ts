import { StepFn, StepOptions } from "https://deno.land/x/cicada/mod.ts";

/**
 * Installs package.json dependencies using pnpm, yarn or npm (in that order).
 */
export function installDependencies(): StepOptions {
  const installScript: StepFn = async () => {
    const command = "npm install";

    console.log(`Running: ${command}`);
    const p = Deno.run({ cmd: command.split(" ") });
    const status = await p.status();
    p.close();

    if (!status.success) {
      throw new Error(`Failed to install dependencies with '${command}'.`);
    }
  };

  return {
    name: "Install Node Dependencies with NPM",
    run: installScript,
  };
}

import { StepFn } from "https://deno.land/x/cicada/mod.ts";

import {
  installPackageBasedOnPackageManager,
  PackageManager,
  PackageManagerInput,
} from "./installPackageBasedOnPackageManager.ts";

/**
 * A function that outputs a function. The second function takes a version (which defaults to latest) and then installs
 */

export function createPackageInstallStep(
  packageName: string,
  packageManagerNameToPackageNameMap: Record<PackageManager, string>,
) {
  return function (version = "latest") {
    const stepFn: StepFn = async () => {
      const packageConfig: Partial<
        Record<
          PackageManager,
          PackageManagerInput[]
        >
      > = {};

      for (const manager in packageManagerNameToPackageNameMap) {
        const key = manager as PackageManager;
        packageConfig[key] = [{
          name: packageManagerNameToPackageNameMap[key],
          version: version,
        }];
      }

      await installPackageBasedOnPackageManager(packageConfig);
    };

    return {
      name: `Install ${
        packageName[0].toUpperCase() + packageName.slice(1)
      } cli`,
      run: stepFn,
    };
  };
}

/**
 * Checks if a command is available in the system.
 */
export async function hasCommand(command: string): Promise<boolean> {
  try {
    const process = Deno.run({
      cmd: ["command", "-v", command],
      stdout: "null",
      stderr: "null",
    });

    const status = await process.status();
    process.close();

    return status.success;
  } catch (error) {
    console.error(`Error checking for command '${command}': ${error}`);
    return false;
  }
}

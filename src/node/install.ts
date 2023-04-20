import { StepFn, StepOptions } from "https://deno.land/x/cicada/mod.ts";

async function installNodeUsingCurl(version: string): Promise<void> {
  const downloadUrl =
    `https://nodejs.org/dist/${version}/node-${version}-linux-x64.tar.xz`;
  const process = Deno.run({
    cmd: [
      "sh",
      "-c",
      `curl -fsSL ${downloadUrl} | tar -xJf - -C /usr/local --strip-components 1`,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { success } = await process.status();
  process.close();

  if (!success) {
    const errorOutput = new TextDecoder().decode(await process.stderrOutput());
    throw new Error(`Error installing Node.js: ${errorOutput}`);
  }
}

export function install(version: string = "latest"): StepOptions {
  const stepFn: StepFn = async () => {
    if (version === "latest") {
      const response = await fetch(
        "https://nodejs.org/dist/latest/SHASUMS256.txt",
      );
      const data = await response.text();
      const match = data.match(/node-v(\d+\.\d+\.\d+)-/);

      if (!match) {
        throw new Error("Could not find the latest Node.js version.");
      }

      version = `v${match[1]}`;
    }

    await installNodeUsingCurl(version);
  };

  return {
    name: "Install Node.js",
    run: stepFn,
  };
}

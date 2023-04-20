/**
 * Checks if a command is available in the system.
 * @param command - The command to check for.
 * @returns Promise<boolean> - True if the command is available, false otherwise.
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

const PACKAGE_MANAGERS_MAP = [
  {
    name: "apt-get",
    installArgs: ["install", "-y"],
    updateArgs: ["update"],
  },
  {
    name: "pacman",
    installArgs: ["-S", "--noconfirm"],
    updateArgs: ["-Sy"],
  },
  {
    name: "yum",
    installArgs: ["install", "-y"],
    updateArgs: ["update"],
  },
  {
    name: "dnf",
    installArgs: ["install", "-y"],
    updateArgs: ["update"],
  },
  {
    name: "apk",
    installArgs: ["add"],
    updateArgs: ["update"],
  },
  {
    name: "pkg",
    installArgs: ["install"],
    updateArgs: ["update"],
  },
] as const;

const PACKAGE_MANAGER = PACKAGE_MANAGERS_MAP.map((pm) => pm.name);
export type PackageManager = typeof PACKAGE_MANAGER[number];

async function findExecutable(name: string): Promise<string | null> {
  const pathEnv = Deno.env.get("PATH");
  if (!pathEnv) {
    return null;
  }
  const paths = pathEnv.split(Deno.build.os === "windows" ? ";" : ":");
  for (const path of paths) {
    const fullPath = `${path}/${name}`;
    try {
      const fileInfo = await Deno.stat(fullPath);
      if (fileInfo.isFile && fileInfo.mode && fileInfo.mode & 0o111) {
        // The file exists and is executable
        return fullPath;
      }
    } catch (_error) {
      // Ignore errors (file not found, permission denied, etc.)
    }
  }
  return null;
}

async function getPackageManager(): Promise<PackageManager | null> {
  for (const pm of PACKAGE_MANAGERS_MAP) {
    if (await findExecutable(pm.name)) {
      return pm.name;
    }
  }
  return null;
}

/**
 * Install packages using the package manager
 *
 * @example
 * ```ts
 * await installPackages({
 *  "apt-get": ["curl"],
 *  "pacman": ["curl"],
 *  "yum": ["curl"],
 * });
 *
 * // or
 *
 * await installPackages({
 *  "apt-get": ["libssl-dev", "libcurl4-openssl-dev", "libz-dev"],
 *  "pacman": ["openssl", "curl", "zlib"],
 *  "yum": ["openssl-devel", "curl-devel", "zlib-devel"],
 * });
 * ```
 *
 * @param map a map of package manager to packages to install
 */
export async function installPackages(map: Record<PackageManager, string[]>) {
  const packageManager = await getPackageManager();

  if (!packageManager) {
    throw new Error("No package manager found");
  }

  const packages = map[packageManager];
  if (!packages) {
    throw new Error(`No package manager found for ${packageManager}`);
  }

  const updateArgs = [
    ...PACKAGE_MANAGERS_MAP.find((p) => p.name === packageManager)!
      .updateArgs,
  ];

  const updateCmd = new Deno.Command(
    packageManager,
    {
      args: updateArgs,
    },
  );

  const updateStatus = await updateCmd.spawn().status;
  if (!updateStatus.success) {
    throw new Error(
      `Failed to update package manager index for ${packageManager}`,
    );
  }

  const installArgs = [
    ...PACKAGE_MANAGERS_MAP.find((p) => p.name === packageManager)!.installArgs,
    ...packages,
  ];

  const cmd = new Deno.Command(
    packageManager,
    {
      args: installArgs,
    },
  );

  const status = await cmd.spawn().status;
  if (!status.success) {
    throw new Error(`Failed to install packages with ${packageManager}`);
  }
}

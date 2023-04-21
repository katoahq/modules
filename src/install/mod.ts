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
  {
    name: "brew",
    installArgs: ["install"],
    updateArgs: ["update"],
  },
] as const;

const PACKAGE_MANAGER = PACKAGE_MANAGERS_MAP.map((pm) => pm.name);
export type PackageManager = typeof PACKAGE_MANAGER[number];

export type PackageManagerPackage = {
  name: string;
  version?: string;
};

export type PackageManagerInput = string | PackageManagerPackage;

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
 *  "apt-get": [{ name: "curl", version: "7.68.0-1ubuntu2.6" }],
 *  "pacman": ["curl"],
 *  "yum": [{ name: "curl", version: "7.61.1-18.el8" }],
 * });
 * ```
 *
 * @param map a map of package manager to packages to install
 */
export async function installPackages(
  map: Record<PackageManager, PackageManagerInput[]>,
) {
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
    ...packages.map((input) => {
      const pkg = typeof input === "string" ? { name: input } : input;
      if (
        packageManager === "apt-get" || packageManager === "yum" ||
        packageManager === "dnf"
      ) {
        return `${pkg.name}${pkg.version ? `=${pkg.version}` : ""}`;
      } else if (packageManager === "brew" && pkg.version) {
        return `${pkg.name}@${pkg.version}`;
      } else {
        return pkg.name;
      }
    }),
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

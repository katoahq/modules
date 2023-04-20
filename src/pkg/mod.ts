const PACKAGE_MANAGERS_MAP = [
  {
    name: "apt-get",
    installArgs: ["install", "-y"],
  },
  {
    name: "pacman",
    installArgs: ["-S", "--noconfirm"],
  },
  {
    name: "yum",
    installArgs: ["install", "-y"],
  },
  {
    name: "dnf",
    installArgs: ["install", "-y"],
  },
  {
    name: "apk",
    installArgs: ["add"],
  },
  {
    name: "pkg",
    installArgs: ["install"],
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
  const pm = await getPackageManager();

  if (!pm) {
    throw new Error("No package manager found");
  }

  let args = map[pm];
  if (!args) {
    throw new Error(`No package manager found for ${pm}`);
  }

  args = [
    ...PACKAGE_MANAGERS_MAP.find((p) => p.name === pm)!.installArgs,
    ...args,
  ];

  const cmd = new Deno.Command(
    pm,
    {
      args,
    },
  );

  const status = await cmd.spawn().status;
  if (!status.success) {
    throw new Error(`Failed to install package`);
  }
}

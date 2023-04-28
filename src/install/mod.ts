import {
  installPackageBasedOnPackageManager,
} from "./installPackageBasedOnPackageManager.ts";

import { createPackageInstallStep } from "./utils.ts";

export { installPackageBasedOnPackageManager };

export const node = createPackageInstallStep("node", {
  "apt-get": "nodejs",
  "pacman": "nodejs",
  "yum": "nodejs",
  "dnf": "nodejs",
  "apk": "nodejs",
  "pkg": "node",
  "brew": "node",
});

export const github = createPackageInstallStep("github", {
  "apt-get": "gh",
  "pacman": "github-cli",
  "yum": "gh",
  "dnf": "gh",
  "apk": "gh",
  "pkg": "gh",
  "brew": "gh",
});

export const aws = createPackageInstallStep("aws", {
  "apt-get": "awscli",
  "pacman": "aws-cli",
  "yum": "awscli",
  "dnf": "awscli",
  "apk": "aws-cli",
  "pkg": "aws-cli",
  "brew": "awscli",
});

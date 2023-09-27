# Katoa Module Registry (WIP, Likely not working yet)

The Katoa Module Registry is a collection of 3rd-party code modules. These
modules abstract over Katoa **jobs**, abstract over Katoa **steps**, and
provide other general utility functions.

### 🕵️ Explore

Head to [deno.land/x/katoa_modules](https://deno.land/x/katoa_modules) to see
all the modules

### 🔥 Usage

```typescript
import * as npm from "https://deno.land/x/katoa_modules/npm/mod.ts";

npm.installDependencies();
```

### ⭐️ Examples

**Step abstractions**

```typescript
import { Job, Pipeline, Secret } from "https://deno.land/x/katoa/lib.ts";
import * as npm from "https://deno.land/x/katoa_modules/npm/mod.ts"

const publish = new Job({
	image: "ubuntu:22.04",
	steps: [
		npm.installNode({version: "16.4"}),
		npm.installDependencies(),
		npm.publish(token: new Secret.value("npm-token") ),
	]
})

export new Pipeline([ publish ])
```

**Job Abstraction**

```typescript
import { Job, Pipeline, Secret } from "https://deno.land/x/katoa/lib.ts";
import * as npm from "https://deno.land/x/katoa_modules/npm/mod.ts"
import * as terraform from "https://deno.land/x/katoa_modules/terraform/mod.ts"
import * as snyk from "https://deno.land/x/katoa_modules/snyk/mod.ts"

export new Pipeline([
    new npm.TestSuite({ nodeVersion: "16.4"}),
    new npm.Publish({ token: new Secret.value("npm-token") }),
    new terraform.Deploy({ token: new Secret.value("terraform-token") }),
    new snyk.SecurityChecks({ token: new Secret.value("snyk-token") }),
])
```

### 😎 Contribute

Have a module idea? Contribute it. ChatGPT makes it ridiculously easy...

Check out [contributing](/CONTRIBUTING.md).

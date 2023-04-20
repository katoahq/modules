# Cicada Module Registry

The Cicada Module Registry is a collection of 3rd-party code modules. These
modules abstract over Cicada **jobs**, abstract over Cicada **steps**, and
provide other general utility functions.

### Explore

Head to [deno.land/x/cicada_modules](https://deno.land/x/cicada_modules) to see
all the modules

### Usage

```typescript
import * as npm from "https://deno.land/x/cicada_modules/npm/mod.ts";

npm.installDepencies();
```

### Examples

**Step abstractions**

```typescript
import { Job, Pipeline, Secret } from "https://deno.land/x/cicada/lib.ts";
import * as npm from "https://deno.land/x/cicada_modules/npm/mod.ts"

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
import { Job, Pipeline, Secret } from "https://deno.land/x/cicada/lib.ts";
import * as npm from "https://deno.land/x/cicada_modules/npm/mod.ts"
import * as terraform from "https://deno.land/x/cicada_modules/terraform/mod.ts"
import * as snyk from "https://deno.land/x/cicada_modules/snyk/mod.ts"

export new Pipeline([
    new npm.TestSuite({ nodeVersion: "16.4"}),
    new npm.Publish({ token: new Secret.value("npm-token") }),
    new terraform.Deploy({ token: new Secret.value("terraform-token") }),
    new snyk.SecurityChecks({ token: new Secret.value("snyk-token") }),
])
```

import { Job, Pipeline } from "https://deno.land/x/cicada/mod.ts";
import * as node from "../mod.ts";

const job = new Job({
  name: "My second Job",
  image: "ubuntu:22.04",
  steps: [
    {
      name: "Print a message",
      run: "echo Hello, world!",
    },
    {
      name: "Run a js function",
      run: () => {
        console.log("Hello from js");
      },
    },
    node.install(),
    node.installDependencies(),
  ],
});

export default new Pipeline([job]);

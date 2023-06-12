import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    routes: {
      "POST /checkin": "packages/functions/src/checkIn.handler",
      "POST /setup": "packages/functions/src/setup.handler",
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

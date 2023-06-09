import { StackContext, Api } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    routes: {
      "POST /checkin": "packages/functions/src/checkIn.handler",
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}

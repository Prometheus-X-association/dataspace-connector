import { PolicyFetcher } from "../access-control/PolicyFetcher";

const fetcher = new PolicyFetcher({
    count: { url: "http://count-url" },
});

// fetcher.context.count();
fetcher.context.count();

# Dataspace Connector Contribution Guidance

## Scope and Structure

- Keep TypeScript source code under `src/` and preserve the existing versioned API layout: `controllers/<visibility>/v1`, `services/<visibility>/v1`, and `routes/<visibility>/v1`.
- Follow the established file names: lowercase, dot-separated role and visibility suffixes, for example `catalog.private.service.ts` and `provider.public.controller.ts`.
- Keep controllers thin. Read HTTP input from the Express request, call a service, return through `restfulResponse`, and delegate failures with `next(err)`.
- Put data access and business logic in services. Keep cross-cutting request validation and error formatting in the existing middleware.
- Reuse existing types, response helpers, configuration loaders, loggers, and error classes before adding new utilities or parallel abstractions.
- Validate public request input through the existing `express-validator` middleware. Do not bypass validation in a controller.

## TypeScript and Formatting

- Use TypeScript with explicit parameter and return types where inference does not make the contract clear. `tsconfig.json` enables `noImplicitAny`.
- Do not introduce `any`. Prefer existing interfaces, a narrow union, generics, `unknown` with type narrowing, or a new focused type.
- Use `async` and `await` for asynchronous control flow, matching the surrounding code.
- Follow Prettier and ESLint: 4-space indentation, single quotes, and trailing commas where the formatter applies them.
- Do not leave `console` calls in application code. Use the project `Logger` for operational logging; retain an ESLint exception only where a console write is intentionally required.

## API, Errors, and Security

- Preserve the existing response shape and status-code conventions. Use `restfulResponse` for successful REST responses unless an established endpoint pattern requires another response helper.
- Forward controller and middleware failures to the established global error handler. Do not expose stack traces, secrets, or internal implementation details in API responses.
- Use `CustomError` and the existing error helpers for expected domain failures. Log errors with actionable `message` and `location` fields.
- Treat connector URLs, credentials, consent data, JWTs, policies, and configuration as sensitive. Do not log their raw contents or add hard-coded secrets.
- When modifying an API contract, keep routes, validators, controllers, OpenAPI annotations/options, and relevant documentation in sync. Regenerate Swagger when applicable.

## Tests and Verification

- Add or update focused tests for observable behavior changes. Place them under the corresponding `src/tests/` area and use the existing `*.spec.ts` naming.
- Use Mocha, Chai, and Sinon conventions already present in the repository. Restore Sinon stubs and spies in `afterEach` with `sinon.restore()`.
- Prefer testing service behavior with focused dependency stubs and API behavior with the existing API test setup.
- Run the narrowest relevant test command first, then run `pnpm lint` and `pnpm build` when the change warrants broader verification.

## Comments and Written Content

- Write comments only when they explain intent, protocol constraints, security decisions, or non-obvious behavior. Keep comments accurate, concise, and grammatically complete.
- Use JSDoc for exported functions when it adds useful contract information. Describe parameters and return values specifically rather than repeating the function name.
- Update user-facing documentation in `docs/` when behavior, setup, configuration, or externally visible API semantics change.
- Never use em dashes in generated content: code comments, JSDoc, documentation, commit messages, API text, logs, test descriptions, or chat responses. Use commas, colons, parentheses, semicolons, or separate sentences instead.

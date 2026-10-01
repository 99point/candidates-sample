import { html } from 'hono/html';
import type { PropsWithChildren } from 'hono/jsx';

/** The HTML document every page renders into. */
export function Document({ title, children }: PropsWithChildren<{ title: string }>) {
  return html`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main>${children}</main>
  </body>
</html>`;
}

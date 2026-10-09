# Standalone runtime exports

The editable simulator now lives in the typed `src/` modules. `app/index.html`
is the development entry. `npm run build` produces a standalone HTML file and
refreshes `index.html`, `isolate/index.html`, and the generated runtime files
in this folder.

- `npm run dev` or `npm run dev:source`: develop the typed simulator.
- `npm run build`: rebuild all standalone exports from the typed source.
- `npm run build:source`: bundle the generated runtime to `dist-source/`.
- `npm run check:standalone`: verify the root HTML against these exports.
- `npm run build:standalone`: recreate the root HTML from these exports.

Do not edit the generated runtime files directly. Run `npm run build` after
editing the typed source. Flight and multiplayer diagnostics exercise the same
source that builds the published HTML. No tests are connected to Actions.

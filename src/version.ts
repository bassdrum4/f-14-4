// The app's semantic version, read straight from package.json so the number
// shown to the pilot is always the number the project is stamped with — no
// second copy to forget to bump.

import pkg from "../package.json";

/** e.g. "1.0.0" — shown as the version badge on the main menu. */
export const APP_VERSION: string = pkg.version;

# User Interface Localization

The user interface is localized using the [React intl](https://formatjs.github.io/docs/getting-started/installation/)
library.

Localization requires the following steps:

- Add a corresponding file into `src/i18n`.
- Add a constant into `src/util/Constants.ts`.
- Add an SVG flag icon into `public/flags`. The icons can be found at https://nucleoapp.com/svg-flag-icons.
- Add locale data loading in `src/index.tsx`.

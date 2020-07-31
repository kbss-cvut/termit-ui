# TermIt UI

This project was bootstrapped with [Create React App](https://github.com/wmonk/create-react-app-typescript), TypeScript version.

The backend is developed separately and their communication is enabled via CORS support on the backend.

Upon Running the code, you will need to edit config/server.json and supply:
- server URL - URL to the TermIt server (see https://github.com/kbss-cvut/termit for details)

## Tests

[Jest](https://jestjs.io/en/) is used for testing the TermIt UI code.

The proposed test structure consists of:

* **Unit tests** - should test singular classes/components. The tests should be put in a `__tests__` directory
next to the file they test (see `src/reducer` and `src/reducer/__tests__`).
* **Integration tests** - tests using multiple components and classes. These include sanity tests,
regression tests and general integration tests. These should be put in the `src/__tests__` directory. Further structuring
is recommended (e.g., the sanity tests are currently in `src/__tests__/sanity`).

To enable easy integration with Jest's file name matching, all test files should have the pattern `*.test.ts(x)`. The actual
name of the file (before the first dot) should reflect the purpose of the test file, e.g., for unit tests this is the name of the
tested file (see for example `TermItReducers.ts` and the corresponding `TermItReducers.test.ts`).

General testing utilities should be put in `src/__tests__/environment`.

### Internationalization in Tests

Since most of the components are localized, they expect intl-related functions like `i18n`, `formatMessage` (specified in `HasI18n`). To be able to render such components
in tests, there are two things that need to be done:
1. Render the component using `mountWithIntl` instead of Enzyme's default `mount`. This wraps the component in an `IntlProvider`, which sets up the intl context.
2. Pass the intl-related functions to the component. This can be done by invoking the `intlFunctions` function, which returns an object with all the necessary functions/objects.

So mounting the component in tests can look for example as follows:
```jsx harmony
const wrapper = mountWithIntl(<CreateVocabulary onCreate={onCreate} {...intlFunctions()}/>);
```

Note that this means that `wrapper` is not the actual tested component but an instance of `IntlProvider` wrapping the component. `mountWithIntl` also provides a default Redux store
mock which is required by some components.

If shallow rendering is used, use the regular Enzyme `shallow` method to mount the component and set up the intl context using the `intlFunctions` function.

For example:
```jsx harmony
const wrapper = shallow<CreateVocabulary>(<CreateVocabulary onCreate={onCreate} {...intlFunctions()}/>);
```

Do not forget to import the core component into tests, not the wrapped component!

## Developer Notes

* Action are currently split into `SyncAction`, `AsyncActions` and `ComplexActions`, where `SyncActions` are simple synchronous actions represented by objects,
whereas `AsyncActions` and `ComplexActions` exploit `redux-thunk` and return functions. `ComplexActions` represent actions which involve both synchronous and
asynchronous actions or other additional logic.
* `AsyncActions` API guidelines:
    * _Load_ - use IRI identifiers as parameters (+ normalized name as string if necessary, e.g. when fetching a term).
    * _Create_ - use the instance to be created as parameter + IRI identifier if additional context is necessary (e.g. when creating a term).
    * _Update_ - use the instance to be updated as parameter. It should contain all the necessary data.
    * _Remove_ - use the instance to be removed as parameter.
* Action naming conventions for CRUD operations:
    * _load${ASSET(S)}_ for loading assets from the server, e.g. `loadVocabulary`
    * _create${ASSET}_ for creating an asset, e.g. `createVocabulary`
    * _update${ASSET}_ for updating an asset, e.g. `updateVocabulary`
    * _remove${ASSET}_ for removing an asset, e.g. `removeVocabulary`
* Navigation is handled separately from Redux, although the Redux documentation contains a section on setting up routing with react-router and redux. Currently, I
believe it is not necessary to interconnect the two.
* Localization is now handled by Redux state, so that page refreshes are not necessary when switching language.
* Logout involves no server request, only removal of user token from local storage. This is because JWT is stateless and all user info is stored in the token,
so server keeps no sessions.
* In case a component needs props specified by parent + store-based props (actions, Redux state), interfaces have to defined 
separately and then specified in generic arguments to `connect`. An example of this technique can be found in `TermAssignments`. 
Also, this means that intl props need to be explicitly passed to the component in `connect`. Otherwise, internationalization would not work properly 
(language switching would have no effect). See `TermAssignments` again for a showcase how to do this.
* Marker CSS classes should be used to denote important elements. These classes help in testing. Marker classes should be prefixed with `m-` and no styling should be applied based on them.
* Although there are some problems with testing, it is possible to use [React Hooks](https://reactjs.org/docs/hooks-intro.html) in the code. See `PasswordReset`. The workaround for
 testing components with hooks can bee seen by inspecting the Git history of `Users.tests`.


## Debugging

* Tests can be debugged directly in IDEA just like JUnit tests - IDEA is able to run singular tests.
* The application can be debugged in IDEA as well, see the [JetBrains blog](https://blog.jetbrains.com/webstorm/2017/01/debugging-react-apps/).

## Mocking Server REST API
It is possible to mock server REST API, so that the application can be developed and run without having to start the backend application.
To do so, use `npm run start-mock-rest`, which sets environment variables telling the app to mock the REST API. Now, the mock API is set up
in `src/util/Ajax`, function `mockRestApi`, we are using [Axios Mock Adapter](https://github.com/ctimmerm/axios-mock-adapter). The usage should be
fairly intuitive. Data should be kept in JSON files in `src/rest-mock` (has to be in `src`, otherwise webpack refuses to import the data).

## Adjusting Bootstrap Styles

It is possible to adjust the styling of the application. We are using Bootstrap which provides SCSS definitions which can be overridden. Based on the
documentation [here](https://getbootstrap.com/docs/4.0/getting-started/webpack/#importing-precompiled-sass) and [here](https://getbootstrap.com/docs/4.0/getting-started/theming/),
there is the `_custom.scss` file in `src`. This file allows to override default Bootstrap styles and its content is automatically imported in the application.

## Documentation

Further documentation is in the [doc folder](doc/index.md).

## License

Licensed under LGPL v3.0.

Tento repozitář je udržován v rámci projektu OPZ č. CZ.03.4.74/0.0/0.0/15_025/0004172.
![Evropská unie - Evropský sociální fond - Operační program Zaměstnanost](https://data.gov.cz/images/ozp_logo_cz.jpg)

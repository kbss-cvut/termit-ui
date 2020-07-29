import * as React from "react";
import {ReactElement} from "react";
import {mount, MountRendererProps} from "enzyme";
import intlData from "../../i18n/en";
import {IntlProvider} from "react-intl";
import {Provider} from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import TermItState from "../../model/TermItState";
// @ts-ignore
import TimeAgo from "javascript-time-ago";

export const mockStore = configureMockStore([thunk])(new TermItState());

const scheduler = typeof setImmediate === "function" ? setImmediate : setTimeout;

/**
 * Uses enzyme"s mount function, but wraps the specified component in Provider and IntlProvider, so that Redux and
 * React Intl context are set up.
 * @param node The element to render
 * @param options Optional rendering options for Enzyme
 */
export function mountWithIntl(node: ReactElement<any>, options?: MountRendererProps) {
    // Load locales for the TimeAgo library
    TimeAgo.addLocale(require("javascript-time-ago/locale/en"));
    // This weird workaround allows us to use setProps to set props of the component under test even though it is
    // not the root rendered component (which setProps in Enzyme requires)
    // See https://github.com/airbnb/enzyme/issues/1925#issuecomment-463248558
    const ComponentUnderTest = node.type;
    const properties = node.props;
    return mount(React.createElement(
        props => <Provider store={mockStore}>
            <IntlProvider {...intlData}>
                <ComponentUnderTest {...props} />
            </IntlProvider>
        </Provider>, properties), options);
}

/**
 * Utility function to flush all pending promises in an async test.
 */
export function flushPromises() {
    return new Promise((resolve) => {
        scheduler(resolve, 0);
    });
}

/**
 * Mocks the window.getSelection function.
 * @param selection The selection object to return
 */
export function mockWindowSelection(selection: object) {
    window.getSelection = jest.fn().mockImplementation(() => {
        return Object.assign(
            {},
            selection
        );
    });
}

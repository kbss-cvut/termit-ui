import { ReactElement } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import intlData from "../../i18n/en";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import TermItState from "../../model/TermItState";
import { mock as stompMock, StompSessionProvider } from "react-stomp-hooks";
// @ts-ignore
import TimeAgo from "javascript-time-ago";
import IntlData from "../../model/IntlData";
import { WebSocketWrapper } from "../../WebSocketApp";
import { vi } from "vitest";

export const mockStore = configureMockStore<TermItState>([thunk])(
  new TermItState()
);

const scheduler =
  typeof setImmediate === "function" ? setImmediate : setTimeout;
/**
 * Wraps the specified component in Provider and IntlProvider, so that Redux and React Intl context are set up,
 * and renders it using React Testing Library's `render` function.
 *
 * @param node The element to render
 * @param options Optional React Testing Library render options
 * @param intl Optional intl data. If not specified, default will be used
 */
export function renderWithIntl(
  node: ReactElement<any>,
  options?: RenderOptions,
  intl: IntlData = intlData
): RenderResult {
  // Load locales for the TimeAgo library
  TimeAgo.addLocale(require("javascript-time-ago/locale/en"));
  return render(node, {
    wrapper: ({ children }) => (
      <Provider store={mockStore}>
        <IntlProvider {...intl}>{children}</IntlProvider>
      </Provider>
    ),
    ...options,
  });
}

/**
 * Utility function to flush all pending promises in an async test.
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    scheduler(resolve, 0);
  });
}

/**
 * Mocks the window.getSelection function.
 * @param selection The selection object to return
 */
export function mockWindowSelection(selection: object) {
  window.getSelection = vi.fn().mockImplementation(() => {
    return Object.assign({}, selection);
  });
}

/**
 * Simulates a delay in Promise resolution (useful for simulating delay for Ajax invoking promises).
 *
 * Note that fake timers need to be used with this method. See TermMetadataCreateForm tests for usage example.
 * @param ms Delay in milliseconds
 * @param value Value to resolve the promise with
 */
export function promiseDelay(ms: number, value: any): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms, value));
}

export function withWebSocket(node: ReactElement) {
  return (
    <WebSocketWrapper Provider={stompMock.StompSessionProviderMock}>
      {node}
    </WebSocketWrapper>
  );
}

export const webSocketProviderWrappingComponentOptions = {
  wrappingComponent: StompSessionProvider,
};

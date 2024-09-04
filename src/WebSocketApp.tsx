import * as React from "react";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import Constants from "./util/Constants";
import SecurityUtils from "./util/SecurityUtils";
import DISPATCHERS, {
  dispatcherExceptionHandler,
  WebSocketDispatcher,
} from "./reducer/WebSocketDispatchers";
import { ThunkDispatch } from "./util/Types";
import { useDispatch } from "react-redux";
import { StompSessionProvider, useSubscription } from "react-stomp-hooks";
import { StompConfig } from "@stomp/stompjs";
import BrowserStorage from "./util/BrowserStorage";

interface StompSessionProviderProps extends StompConfig {
  // missing export in the lib
  /**
   * The URL to connect to the STOMP broker.
   * The URL can be a SockJS URL (http(s)://) or a raw Websocket URL (ws(s)://).
   */
  url: string;
  children: ReactNode;
  /**
   * If the STOMP connection should be enabled/disabled. Defaults to true.
   */
  enabled?: boolean;
  /**
   * The name of the StompSessionContext.
   * This can be used to mix multiple StompSessionProviders/Stomp Connections in the same application.
   * The default name is "default". When using a custom name, the same name must be specified as a parameter for all hooks and hocs.
   *
   */
  name?: string;
}

/**
 * Creates subscription for specified dispatcher
 */
const WebSocketDispatcherSubscriber: React.FC<{
  dispatcher: WebSocketDispatcher<any>;
}> = ({ dispatcher }) => {
  const { destinations, action, onMessage, headers } = dispatcher;
  const dispatch: ThunkDispatch = useDispatch();

  useSubscription(
    destinations,
    async (message) => {
      try {
        await onMessage(message, action, dispatch);
      } catch (error: any) {
        dispatcherExceptionHandler(error, action, dispatch);
      }
    },
    headers
  );

  return <></>;
};

/**
 * @return all dispatchers from {@link DISPATCHERS}
 */
function registerDispatchers() {
  const result: ReactElement[] = [];

  for (const dispatchersKey in DISPATCHERS) {
    result.push(
      <WebSocketDispatcherSubscriber
        key={"WebSocketDispatcher-" + dispatchersKey}
        dispatcher={DISPATCHERS[dispatchersKey]}
      />
    );
  }

  return result;
}

export type StompSessionProviderType = (
  props: { children?: any } & StompSessionProviderProps
) => JSX.Element;

/**
 * Wraps all children with {@link StompSessionProvider} and registers dispatchers for websocket.
 * @see registerDispatchers
 * @see <a href="https://github.com/SvenKirschbaum/react-stomp-hooks">React STOMP hooks</a>
 */
export const WebSocketWrapper: React.FC<{
  Provider?: StompSessionProviderType;
}> = ({ children, Provider = StompSessionProvider }) => {
  const [securityToken, setSecurityToken] = useState<string>("");

  useEffect(() => {
    const callback = () => {
      const token = SecurityUtils.loadToken();
      // using length prevents from aborting websocket due to token refresh
      // but will abort it when token is cleared or new one is set
      if (token.length !== securityToken.length) {
        setSecurityToken(token);
      }
    };
    callback();
    return BrowserStorage.onTokenChange(callback);
  }, [securityToken]);

  return (
    <Provider
      enabled={securityToken.trim() !== ""}
      url={Constants.WEBSOCKET_URL}
      connectHeaders={{
        Authorization: securityToken,
      }}
      onUnhandledMessage={(msg) => console.warn("Unhandled STOMP message", msg)}
      onUnhandledFrame={(frame) => console.warn("Unhandled STOMP frame", frame)}
      onUnhandledReceipt={(receipt) =>
        console.warn("Unhandled STOMP receipt", receipt)
      }
    >
      {registerDispatchers()}
      {children}
    </Provider>
  );
};

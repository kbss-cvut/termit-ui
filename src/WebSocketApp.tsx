import * as React from "react";
import { ReactElement, useEffect } from "react";
import Constants from "./util/Constants";
import SecurityUtils from "./util/SecurityUtils";
import DISPATCHERS, {
  dispatcherExceptionHandler,
  WebSocketDispatcher,
} from "./reducer/WebSocketDispatchers";
import { ThunkDispatch } from "./util/Types";
import { useDispatch } from "react-redux";
import { StompSessionProvider, useSubscription } from "react-stomp-hooks";
import { StompSessionProviderProps } from "react-stomp-hooks";

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
  const [securityToken, setSecurityToken] = React.useState<string>("");
  const [isTokenMissing, setIsTokenMissing] = React.useState<boolean>(true);
  const token = SecurityUtils.loadToken();
  useEffect(() => {
    setSecurityToken(SecurityUtils.loadToken());
    setIsTokenMissing(token == null || token.trim() === "");
  }, [token]);
  return (
    <Provider
      url={isTokenMissing ? "" : Constants.WEBSOCKET_URL}
      connectHeaders={{
        Authorization: securityToken,
      }}
      onUnhandledMessage={(msg) => console.warn("Unhandled STOMP message", msg)}
      onUnhandledFrame={(frame) => console.warn("Unhandled STOMP frame", frame)}
      onUnhandledReceipt={(receipt) =>
        console.warn("Unhandled STOMP receipt", receipt)
      }
      onConnect={(frame) => console.debug("WebSocket connected")}
    >
      {registerDispatchers()}
      {children}
    </Provider>
  );
};

export const withWebSocket = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props) => {
    return (
      <WebSocketWrapper>
        <Component {...(props as P)} />
      </WebSocketWrapper>
    );
  };
};

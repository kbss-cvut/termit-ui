import { Client } from "react-stomp-hooks";

export type HasStompClient = { stompClient: Client };

export type WithInjectedStompClient<P> = Omit<P, "stompClient"> & {
  stompClient?: Client;
};

// export function withStompClient<P extends HasStompClient>(
//   WrappedComponent: React.ComponentType<P>
// ) {
//   return withRealStompClient(WrappedComponent) as React.ComponentType<
//     WithInjectedStompClient<P>
//   >;
// }

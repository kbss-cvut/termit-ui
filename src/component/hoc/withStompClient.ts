import { Client } from "react-stomp-hooks";

export type StompClient = Client;

/**
 * @see import('react-stomp-hooks')#withStompClient
 */
export type HasStompClient = { stompClient: StompClient };

/**
 * Declaration of useful, reusable types.
 */

import { ThunkDispatch as TDispatch } from "redux-thunk";
import TermItState from "../model/TermItState";
import { Action } from "redux";
import { match } from "react-router";
import { Location } from "history";

/**
 * Simple name for Thunk Dispatch, providing the required generic type arguments.
 *
 * Action can be specified.
 */
export type ThunkDispatch<A extends Action = Action> = TDispatch<
  TermItState,
  null,
  Action
>;

/**
 * Simple name for a function retrieving state from the store.
 */
export type GetStoreState = () => TermItState;

/**
 * Mapper of values to JSX elements.
 */
export type ValueMapper<T> = (data: T) => JSX.Element | null;

/**
 * Represents parameters passed to the fetchOptions handler of the tree select component.
 */
export interface TreeSelectFetchOptionsParams<T> {
  searchString?: string;
  optionID?: string;
  limit?: number;
  offset?: number;
  option?: T;
}

/**
 * Term fetching options.
 *
 * Extends options passed from the tree select component with additional configuration.
 */
export interface TermFetchParams<T> extends TreeSelectFetchOptionsParams<T> {
  includeImported?: boolean;
  includeTerms?: string[];
}

/**
 * Type representing literal values.
 */
export type Literal = number | string | boolean;

export interface BasicRouteProps {
  match: match<any>;
  location: Location;
}

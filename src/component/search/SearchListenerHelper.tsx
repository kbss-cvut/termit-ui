import * as React from "react";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  addSearchListener,
  removeSearchListener,
} from "../../action/SearchActions";

/**
 * Registers a search listener so the navbar FTS overlay works on all pages.
 */
export default function SearchListenerHelper() {
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(addSearchListener());
    return () => {
      dispatch(removeSearchListener());
    };
  }, [dispatch]);
  return null;
}

import React from "react";
import Term, { TermInfo } from "../../../model/Term";
import TermItState from "../../../model/TermItState";
import { useSelector } from "react-redux";
import { createTermNonTerminalStateMatcher } from "../TermTreeSelectHelper";

const IfNotInTerminalState: React.FC<{
  term: Term | TermInfo;
  children?: React.ReactNode;
}> = ({ term, children }) => {
  const terminalStates = useSelector(
    (state: TermItState) => state.terminalStates
  );
  return createTermNonTerminalStateMatcher(terminalStates)(term) ? (
    <>{children}</>
  ) : null;
};

export default IfNotInTerminalState;

import React from "react";
import Term, { TermInfo } from "../../../model/Term";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { createTermNonTerminalStateMatcher } from "../TermTreeSelectHelper";
import TerminalTermStateIcon from "./TerminalTermStateIcon";

const StoreBasedTerminalTermStateIcon: React.FC<{
  term: Term | TermInfo;
  id: string;
}> = ({ term, id }) => {
  const states = useSelector((state: TermItState) => state.states);
  return createTermNonTerminalStateMatcher(states)(term) ? null : (
    <TerminalTermStateIcon id={id} className="top-0 ml-1" />
  );
};

export default StoreBasedTerminalTermStateIcon;

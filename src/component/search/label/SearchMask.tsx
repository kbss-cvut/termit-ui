import React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import ContainerMask from "../../misc/ContainerMask";

const SearchMask: React.FC = () => {
  const loading = useSelector((state: TermItState) => state.searchInProgress);
  return loading ? <ContainerMask /> : null;
};

export default SearchMask;

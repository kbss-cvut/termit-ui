import React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { IfGranted } from "react-authorization";
import Unauthorized from "./Unauthorized";
import VocabularyUtils from "../../util/VocabularyUtils";

interface IfUserIsAdminProps {
  renderUnauthorizedAlert?: boolean;
  unauthorized?: React.ReactNode;
}

const IfUserIsAdmin: React.FC<IfUserIsAdminProps> = ({
  renderUnauthorizedAlert = false,
  unauthorized,
  children,
}) => {
  const currentUser = useSelector((state: TermItState) => state.user);
  return (
    <IfGranted
      expected={VocabularyUtils.USER_ADMIN}
      actual={currentUser.types}
      unauthorized={
        renderUnauthorizedAlert &&
        (unauthorized ? unauthorized : <Unauthorized />)
      }
    >
      {children}
    </IfGranted>
  );
};

export default IfUserIsAdmin;

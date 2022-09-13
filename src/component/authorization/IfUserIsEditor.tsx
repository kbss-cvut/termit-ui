import * as React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { IfAuthorized } from "react-authorization";
import Unauthorized from "./Unauthorized";
import { isEditor } from "../../util/Authorization";

interface IfUserIsEditorProps {
  renderUnauthorizedAlert?: boolean; // Whether an alert should be rendered if user is not authorized. Defaults to false
  unauthorized?: React.ReactNode;
}

/**
 * Renders children if current user (taken from Redux store) is not restricted.
 */
const IfUserIsEditor: React.FC<IfUserIsEditorProps> = ({
  renderUnauthorizedAlert = false,
  unauthorized,
  children,
}) => {
  const user = useSelector((state: TermItState) => state.user);
  return (
    <IfAuthorized
      isAuthorized={() => isEditor(user)}
      unauthorized={
        renderUnauthorizedAlert &&
        (unauthorized ? unauthorized : <Unauthorized />)
      }
    >
      {children}
    </IfAuthorized>
  );
};

export default IfUserIsEditor;

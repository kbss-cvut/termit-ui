import React from "react";
import { isUsingOidcAuth } from "../../../util/OidcUtils";

const IfOidcAuth: React.FC = ({ children }) => {
  return isUsingOidcAuth() ? <>{children}</> : null;
};

export default IfOidcAuth;

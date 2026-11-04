import React from "react";
import { isUsingOidcAuth } from "../../../util/OidcUtils";

const IfOidcAuth: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return isUsingOidcAuth() ? <>{children}</> : null;
};

export default IfOidcAuth;

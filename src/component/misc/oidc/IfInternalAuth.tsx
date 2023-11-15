import React from "react";
import { isUsingOidcAuth } from "../../../util/OidcUtils";

const IfInternalAuth: React.FC = ({ children }) => {
  return isUsingOidcAuth() ? null : <>{children}</>;
};

export default IfInternalAuth;

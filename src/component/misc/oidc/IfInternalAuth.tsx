import React from "react";
import { isUsingOidcAuth } from "../../../util/OidcUtils";

const IfInternalAuth: React.FC = ({ children }) => {
  if (isUsingOidcAuth()) {
    return null;
  }
  return <>{children}</>;
};

export default IfInternalAuth;

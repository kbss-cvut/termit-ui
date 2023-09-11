import React from "react";
import { useOidcAuth } from "../../../util/OidcUtils";

const IfInternalAuth: React.FC = ({ children }) => {
  if (useOidcAuth()) {
    return null;
  }
  return <>{children}</>;
};

export default IfInternalAuth;

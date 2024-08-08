import React from "react";

/**
 * Returns children if the expression is true, null otherwise
 */
const If: React.FC<{ expression: boolean }> = ({ expression, children }) => {
  return expression ? <>{children}</> : null;
};

export default If;

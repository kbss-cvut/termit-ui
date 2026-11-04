import React from "react";

/**
 * Returns children if the expression is true, null otherwise
 */
const If: React.FC<{ expression: boolean; children?: React.ReactNode }> = ({
  expression,
  children,
}) => {
  return expression ? <>{children}</> : null;
};

export default If;

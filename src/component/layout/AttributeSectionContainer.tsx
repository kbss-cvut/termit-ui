import * as React from "react";
import "./AttributeSectionContainer.scss";

interface AttributeSectionContainerProps {
    label: string;
}

/**
 * Visual container for grouping asset attributes.
 */
export const AttributeSectionContainer: React.FC<AttributeSectionContainerProps> = (props) => {
  const { label, children } = props;
  return (
    <>
      <hr
        data-content={label}
        className="form-section-text"
      />
      {children}
      <hr className="form-section" />
    </>
  );
};

export default AttributeSectionContainer;

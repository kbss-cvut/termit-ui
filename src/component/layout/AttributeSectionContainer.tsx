import * as React from "react";
import "./AttributeSectionContainer.scss";

interface AttributeSectionContainerProps {
  label: string;
}

/**
 * Visual container for grouping asset attributes.
 */
export const AttributeSectionContainer: React.FC<AttributeSectionContainerProps> =
  (props) => {
    const { label, children } = props;
    return (
      <div className="form-section">
        <h3>{label}</h3>
        <hr className="form-section-separator" />
        {children}
      </div>
    );
  };

export default AttributeSectionContainer;

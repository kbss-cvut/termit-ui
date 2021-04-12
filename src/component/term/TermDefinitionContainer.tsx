import React from "react";
import { useI18n } from "../hook/useI18n";
import "./TermDefinitionBlock.scss";

/**
 * Visual container for term definition-related attributes.
 */
export const TermDefinitionContainer: React.FC = (props) => {
  const { children } = props;
  const { i18n } = useI18n();
  return (
    <>
      <hr
        data-content={i18n("term.metadata.definition")}
        className="hr-definition-text"
      />
      {children}
      <hr className="hr-definition" />
    </>
  );
};

export default TermDefinitionContainer;

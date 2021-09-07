import * as React from "react";
import Term from "../../model/Term";
import DefinitionRelatedTerms from "./DefinitionRelatedTerms";

export interface RelatedTermsProps {
  term: Term;
}

export const RelatedTerms: React.FC<RelatedTermsProps> = (props) => {
  const { term } = props;

  return (
    <div className="additional-metadata-container">
      <DefinitionRelatedTerms term={term} />
    </div>
  );
};

export default RelatedTerms;

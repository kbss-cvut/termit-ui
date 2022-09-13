import * as React from "react";
import CreateVocabulary from "./CreateVocabulary";
import IfUserIsEditor from "../authorization/IfUserIsEditor";

const CreateVocabularyRoute: React.FC = () => {
  return (
    <IfUserIsEditor>
      <CreateVocabulary />
    </IfUserIsEditor>
  );
};

export default CreateVocabularyRoute;

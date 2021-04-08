import * as React from "react";
import CreateVocabulary from "./CreateVocabulary";
import IfUserAuthorized from "../authorization/IfUserAuthorized";

const CreateVocabularyRoute: React.FC = () => {
    return (
        <IfUserAuthorized>
            <CreateVocabulary />
        </IfUserAuthorized>
    );
};

export default CreateVocabularyRoute;

import * as React from "react";
import {useSelector} from "react-redux";
import TermItState from "../../model/TermItState";
import {IfNoneGranted} from "react-authorization";
import VocabularyUtils from "../../util/VocabularyUtils";
import Unauthorized from "../misc/Unauthorized";
import CreateVocabulary from "./CreateVocabulary";

const CreateVocabularyRoute: React.FC = () => {
    const user = useSelector((state: TermItState) => state.user);
    return <IfNoneGranted expected={VocabularyUtils.USER_RESTRICTED} actual={user.types} unauthorized={<Unauthorized/>}>
        <CreateVocabulary/>
    </IfNoneGranted>
}

export default CreateVocabularyRoute;
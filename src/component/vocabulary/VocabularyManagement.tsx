import * as React from "react";
import {injectIntl} from "react-intl";
import {Card, CardBody, Col} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadVocabularies as loadVocabulariesAction} from "../../action/AsyncActions";
import VocabularyList from "./VocabularyList";
import HeaderWithActions from "../misc/HeaderWithActions";
import Routing from "../../util/Routing";
import Vocabulary from "../../model/Vocabulary";

interface VocabularyManagementProps extends HasI18n {
    loadVocabularies: () => void;
}

export const VocabularyManagement: React.FC<VocabularyManagementProps> = props => {
    const {i18n, loadVocabularies} = props;
    React.useEffect(() => {
        loadVocabularies();
    }, [loadVocabularies]);
    const onSelect = (voc: Vocabulary) => {
        if (voc === null) {
            Routing.transitionTo(Routes.vocabularies);
        } else {
            Routing.transitionToAsset(voc);
        }
    };

    return <div>
        <HeaderWithActions title={i18n("vocabulary.management")}/>
        <div className="row">
            <Col md={12}>
                <Card>
                    <CardBody>
                        <VocabularyList onSelect={onSelect}/>
                    </CardBody>
                </Card>
            </Col>
        </div>
    </div>
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        loadVocabularies: () => dispatch(loadVocabulariesAction())
    };
})(injectIntl(withI18n(VocabularyManagement)));

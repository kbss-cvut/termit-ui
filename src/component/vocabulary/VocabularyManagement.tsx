import * as React from "react";
import {injectIntl} from "react-intl";
import {Card, CardBody, Col} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadVocabularies} from "../../action/AsyncActions";
import VocabularyList from "./VocabularyList";
import {Link} from "react-router-dom";
import {GoPlus} from "react-icons/go";
import HeaderWithActions from "../misc/HeaderWithActions";
import Routing from "../../util/Routing";
import Vocabulary from "../../model/Vocabulary";

interface VocabularyManagementProps extends HasI18n {
    loadVocabularies: () => void;
}

export const VocabularyManagement: React.FC<VocabularyManagementProps> = props => {
    React.useEffect(() => {
        props.loadVocabularies();
    }, []);
    const {i18n} = props;
    const onSelect = (voc: Vocabulary) => {
        if (voc === null) {
            Routing.transitionTo(Routes.vocabularies);
        } else {
            Routing.transitionToAsset(voc);
        }
    };
    const buttons = <>
        <Link id="vocabularies-create" key="vocabulary.vocabularies.create"
              className="btn btn-primary btn-sm"
              title={i18n("vocabulary.vocabularies.create.tooltip")}
              to={Routes.createVocabulary.path}><GoPlus/>&nbsp;{i18n("vocabulary.management.new")}
        </Link>
    </>

    return <div>
        <HeaderWithActions title={i18n("vocabulary.management")} actions={buttons}/>
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
        loadVocabularies: () => dispatch(loadVocabularies())
    };
})(injectIntl(withI18n(VocabularyManagement)));

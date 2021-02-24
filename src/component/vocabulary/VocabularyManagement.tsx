import * as React from "react";
import {injectIntl} from "react-intl";
import {Card, CardBody, Col} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadVocabularies as loadVocabulariesAction} from "../../action/AsyncActions";
import VocabularyList from "./VocabularyList";
import {Link} from "react-router-dom";
import {GoPlus} from "react-icons/go";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import TermItState from "../../model/TermItState";
import User from "../../model/User";
import {IfNoneGranted} from "react-authorization";
import VocabularyUtils from "../../util/VocabularyUtils";

interface VocabularyManagementProps extends HasI18n {
    user: User;
    loadVocabularies: () => void;
}

export const VocabularyManagement: React.FC<VocabularyManagementProps> = props => {
    const {i18n, user, loadVocabularies} = props;
    React.useEffect(() => {
        loadVocabularies();
    }, [loadVocabularies]);

    const buttons = <IfNoneGranted expected={VocabularyUtils.USER_RESTRICTED} actual={user.types}>
        <Link id="vocabularies-create" className="btn btn-primary btn-sm"
              title={i18n("vocabulary.vocabularies.create.tooltip")}
              to={Routes.createVocabulary.path}><GoPlus/>&nbsp;{i18n("vocabulary.management.new")}
        </Link>
    </IfNoneGranted>;

    return <div>
        <WindowTitle title={i18n("vocabulary.management.vocabularies")}/>
        <HeaderWithActions title={i18n("vocabulary.management")} actions={buttons}/>
        <div className="row">
            <Col md={12}>
                <Card>
                    <CardBody>
                        <VocabularyList/>
                    </CardBody>
                </Card>
            </Col>
        </div>
    </div>
}

export default connect((state: TermItState) => ({user: state.user}), (dispatch: ThunkDispatch) => {
    return {
        loadVocabularies: () => dispatch(loadVocabulariesAction())
    };
})(injectIntl(withI18n(VocabularyManagement)));

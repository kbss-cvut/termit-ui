import * as React from "react";
import { Card, CardBody, Col } from "reactstrap";
import Routes from "../../util/Routes";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadVocabularies as loadVocabulariesAction } from "../../action/AsyncActions";
import VocabularyList from "./VocabularyList";
import { Link } from "react-router-dom";
import { GoPlus } from "react-icons/go";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import IfUserAuthorized from "../authorization/IfUserAuthorized";
import { useI18n } from "../hook/useI18n";

interface VocabularyManagementProps {
  loadVocabularies: () => void;
}

export const VocabularyManagement: React.FC<VocabularyManagementProps> = (
  props
) => {
  const { loadVocabularies } = props;
  const { i18n } = useI18n();
  React.useEffect(() => {
    loadVocabularies();
  }, [loadVocabularies]);

  const buttons = (
    <IfUserAuthorized renderUnauthorizedAlert={false}>
      <Link
        id="vocabularies-create"
        className="btn btn-primary btn-sm"
        title={i18n("vocabulary.vocabularies.create.tooltip")}
        to={Routes.createVocabulary.path}
      >
        <GoPlus />
        &nbsp;{i18n("vocabulary.management.new")}
      </Link>
    </IfUserAuthorized>
  );

  return (
    <>
      <WindowTitle title={i18n("vocabulary.management.vocabularies")} />
      <HeaderWithActions
        title={i18n("vocabulary.management")}
        actions={buttons}
      />
      <div className="row">
        <Col md={12}>
          <Card>
            <CardBody>
              <VocabularyList />
            </CardBody>
          </Card>
        </Col>
      </div>
    </>
  );
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    loadVocabularies: () => dispatch(loadVocabulariesAction()),
  };
})(VocabularyManagement);

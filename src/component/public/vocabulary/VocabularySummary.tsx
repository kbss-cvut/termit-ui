import * as React from "react";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Vocabulary from "../../../model/Vocabulary";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import ImportedVocabulariesList from "../../vocabulary/ImportedVocabulariesList";
import { connect } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import { loadPublicVocabulary } from "../../../action/AsyncPublicViewActions";
import Utils from "../../../util/Utils";
import { RouteComponentProps, withRouter } from "react-router";
import HeaderWithActions from "../../misc/HeaderWithActions";
import CopyIriIcon from "../../misc/CopyIriIcon";
import Terms from "../term/Terms";
import { selectVocabularyTerm } from "../../../action/SyncActions";
import WindowTitle from "../../misc/WindowTitle";
import { useI18n } from "../../hook/useI18n";

interface VocabularySummaryProps extends RouteComponentProps<any> {
  vocabulary: Vocabulary;

  loadVocabulary: (iri: IRI) => void;
  resetSelectedTerm: () => void;
}

export const VocabularySummary: React.FC<VocabularySummaryProps> = (props) => {
  const { resetSelectedTerm, vocabulary, location, match, loadVocabulary } =
    props;
  const { i18n } = useI18n();

  React.useEffect(() => {
    resetSelectedTerm();
  }, [resetSelectedTerm]);
  React.useEffect(() => {
    const normalizedName = match.params.name;
    const namespace = Utils.extractQueryParam(location.search, "namespace");
    const iri = VocabularyUtils.create(vocabulary.iri);
    if (
      iri.fragment !== normalizedName ||
      (namespace && iri.namespace !== namespace)
    ) {
      loadVocabulary({ fragment: normalizedName, namespace });
    }
  }, [vocabulary, location, match, loadVocabulary]);

  return (
    <div id="public-vocabulary-detail">
      <WindowTitle
        title={`${vocabulary.label} | ${i18n(
          "vocabulary.management.vocabularies"
        )}`}
      />
      <HeaderWithActions
        id="public-vocabulary-summary"
        title={
          <>
            {vocabulary.label}
            <CopyIriIcon url={vocabulary.iri as string} />
          </>
        }
      />
      <Card className="mb-3">
        <CardBody className="card-body-basic-info">
          <Row>
            <Col xl={2} md={4}>
              <Label className="attribute-label">
                {i18n("vocabulary.comment")}
              </Label>
            </Col>
            <Col xl={10} md={8}>
              <Label id="vocabulary-metadata-comment">
                {vocabulary.comment}
              </Label>
            </Col>
          </Row>
          <ImportedVocabulariesList
            vocabularies={vocabulary.importedVocabularies}
          />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Row>
            <Col xs={12}>
              <Terms
                vocabulary={vocabulary}
                match={match}
                location={location}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default connect(
  (state: TermItState) => ({ vocabulary: state.vocabulary }),
  (dispatch: ThunkDispatch) => {
    return {
      loadVocabulary: (iri: IRI) => dispatch(loadPublicVocabulary(iri)),
      resetSelectedTerm: () => dispatch(selectVocabularyTerm(null)),
    };
  }
)(withRouter(VocabularySummary));

import * as React from "react";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import HeaderWithActions from "../../misc/HeaderWithActions";
import CopyIriIcon from "../../misc/CopyIriIcon";
import ImportedVocabulariesList from "../../vocabulary/ImportedVocabulariesList";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import Utils from "../../../util/Utils";
import Terms from "../term/Terms";
import { selectVocabularyTerm } from "../../../action/SyncActions";
import WindowTitle from "../../misc/WindowTitle";
import { useI18n } from "../../hook/useI18n";
import { loadVocabulary } from "../../../action/AsyncActions";
import MarkdownView from "../../misc/MarkdownView";
import { useLocation, useRouteMatch } from "react-router-dom";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

export const VocabularySummary: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const location = useLocation();
  const match = useRouteMatch<{ name: string }>();
  const vocabulary = useSelector((state: TermItState) => state.vocabulary);
  const configuration = useSelector(
    (state: TermItState) => state.configuration
  );

  React.useEffect(() => {
    dispatch(selectVocabularyTerm(null));
  }, [dispatch]);
  React.useEffect(() => {
    const iriFromRoute = Utils.resolveVocabularyIriFromRoute(
      match.params,
      location.search,
      configuration
    );
    const iri = VocabularyUtils.create(vocabulary.iri);
    if (
      iri.fragment !== iriFromRoute.fragment ||
      (iriFromRoute.namespace && iri.namespace !== iriFromRoute.namespace)
    ) {
      trackPromise(
        dispatch(loadVocabulary(iriFromRoute)),
        "vocabulary-summary"
      );
    }
  }, [vocabulary, configuration, location, match, dispatch]);

  return (
    <div id="public-vocabulary-detail">
      <WindowTitle
        title={`${vocabulary.label} | ${i18n(
          "vocabulary.management.vocabularies"
        )}`}
      />
      <PromiseTrackingMask area="vocabulary-summary" />
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
              <MarkdownView id="vocabulary-metadata-comment">
                {vocabulary.comment}
              </MarkdownView>
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

export default VocabularySummary;

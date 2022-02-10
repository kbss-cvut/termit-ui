import * as React from "react";
import Term from "../../../model/Term";
import { Card, CardBody, Col, Row } from "reactstrap";
import Vocabulary from "../../../model/Vocabulary";
import { RouteComponentProps, withRouter } from "react-router";
import BasicTermMetadata from "../../term/BasicTermMetadata";
import LanguageSelector from "../../multilingual/LanguageSelector";
import Terms from "./Terms";

interface TermMetadataProps extends RouteComponentProps<any> {
  term: Term;
  vocabulary: Vocabulary;
  language: string;
  setLanguage: (lang: string) => void;
}

const TermMetadata: React.FC<TermMetadataProps> = (props) => {
  const { term, vocabulary, language, setLanguage } = props;

  return (
    <>
      <LanguageSelector
        key="term-language-selector"
        term={term}
        language={language}
        onSelect={setLanguage}
      />
      <Row>
        <Col xl={9} lg={12}>
          <Row>
            <Col xs={12}>
              <Card className="mb-3">
                <CardBody className="card-body-basic-info">
                  <BasicTermMetadata
                    term={term}
                    withDefinitionSource={false}
                    language={language}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col xl={3} lg={0}>
          <Card>
            <Terms
              vocabulary={vocabulary}
              match={props.match}
              location={props.location}
              isDetailView={true}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default withRouter(TermMetadata);

import * as React from "react";
import Term from "../../model/Term";
// @ts-ignore
import { Col, Label, List, Row } from "reactstrap";
import VocabularyIriLink from "../vocabulary/VocabularyIriLink";
import Utils from "../../util/Utils";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import TermList from "./TermList";
import RelatedTermsList from "./RelatedTermsList";
import TermDefinitionBlock from "./TermDefinitionBlock";
import MarkdownView from "../misc/MarkdownView";
import { useI18n } from "../hook/useI18n";
import Vocabulary from "../../model/Vocabulary";
import TermTypes from "./TermTypes";
import TermState from "./state/TermState";
import { CustomAttributesValues } from "../genericmetadata/CustomAttributesValues";

interface BasicTermMetadataProps {
  term: Term;
  vocabulary: Vocabulary;
  withDefinitionSource?: boolean;
  language: string;
}

function renderItemList(
  listId: string,
  renderItem: (item: string) => JSX.Element,
  items?: string[]
) {
  items = Utils.sanitizeArray(items);
  if (items.length === 0) {
    return null;
  }
  items.sort();
  return (
    <List type="unstyled" id={listId} className="mb-3">
      {items.map((item: string) => (
        <li key={item}>{renderItem(item)}</li>
      ))}
    </List>
  );
}

const BasicTermMetadata: React.FC<BasicTermMetadataProps> = ({
  term,
  vocabulary,
  language,
  withDefinitionSource,
}) => {
  const { i18n } = useI18n();

  return (
    <>
      <TermDefinitionBlock
        term={term}
        language={language}
        withDefinitionSource={withDefinitionSource}
      />
      <Row>
        <Col xl={2} md={4}>
          <Label className="attribute-label mb-3">
            {i18n("term.metadata.types")}
          </Label>
        </Col>
        <Col xl={10} md={8}>
          <TermTypes types={term.types} />
        </Col>
      </Row>
      <TermList
        id="term-metadata-exactmatches"
        label={i18n("term.metadata.exactMatches")}
        language={language}
        vocabularyIri={term.vocabulary?.iri}
        terms={term.exactMatchTerms}
      />
      <TermList
        id="term-metadata-parentterms"
        label={i18n("term.metadata.parent")}
        language={language}
        vocabularyIri={term.vocabulary?.iri}
        terms={term.parentTerms}
      />
      <TermList
        id="term-metadata-subterms"
        label={i18n("term.metadata.subTerms")}
        language={language}
        vocabularyIri={term.vocabulary?.iri}
        terms={term.subTerms}
      />
      <RelatedTermsList term={term} language={language} />
      <Row>
        <Col xl={2} md={4}>
          <Label className="attribute-label mb-3">
            {i18n("term.metadata.notation.label")}
          </Label>
        </Col>
        <Col xl={10} md={8}>
          {renderItemList(
            "term-metadata-notation",
            (notation: string) => (
              <>{notation}</>
            ),
            term.notations
          )}
        </Col>
      </Row>
      <Row>
        <Col xl={2} md={4}>
          <Label className="attribute-label mb-3">
            {i18n("term.metadata.comment")}
          </Label>
        </Col>
        <Col xl={10} md={8}>
          <MarkdownView id="term-metadata-comment">
            {getLocalizedOrDefault(term.scopeNote, "", language)}
          </MarkdownView>
        </Col>
      </Row>
      <Row>
        <Col xl={2} md={4}>
          <Label className="attribute-label mb-3">
            {i18n("term.metadata.example.label")}
          </Label>
        </Col>
        <Col xl={10} md={8}>
          {renderItemList(
            "term-metadata-example",
            (ex: string) => (
              <>{ex}</>
            ),
            (term.examples || {})[language]
          )}
        </Col>
      </Row>
      <CustomAttributesValues asset={term} />
      <Row>
        <Col xl={2} md={4}>
          <Label
            className="attribute-label mb-3"
            title={i18n("term.metadata.vocabulary.tooltip")}
          >
            {i18n("type.vocabulary")}
          </Label>
        </Col>
        <Col xl={10} md={8}>
          <VocabularyIriLink
            id="term-metadata-vocabulary"
            iri={term.vocabulary!.iri!}
          />
        </Col>
      </Row>
      <Row>
        <TermState term={term} vocabulary={vocabulary} />
      </Row>
    </>
  );
};

BasicTermMetadata.defaultProps = {
  withDefinitionSource: false,
};

export default BasicTermMetadata;

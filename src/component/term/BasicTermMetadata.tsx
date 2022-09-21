import * as React from "react";
import Term, { termComparator, TermInfo } from "../../model/Term";
// @ts-ignore
import { Col, Label, List, Row } from "reactstrap";
import VocabularyIriLink from "../vocabulary/VocabularyIriLink";
import Utils from "../../util/Utils";
import OutgoingLink from "../misc/OutgoingLink";
import AssetLabel from "../misc/AssetLabel";
import VocabularyUtils from "../../util/VocabularyUtils";
import { OWL, SKOS } from "../../util/Namespaces";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import TermList from "./TermList";
import RelatedTermsList from "./RelatedTermsList";
import TermDefinitionBlock from "./TermDefinitionBlock";
import MarkdownView from "../misc/MarkdownView";
import { useI18n } from "../hook/useI18n";
import TermStatus from "./TermStatus";
import Vocabulary from "../../model/Vocabulary";

interface BasicTermMetadataProps {
  term: Term;
  vocabulary: Vocabulary;
  withDefinitionSource?: boolean;
  language: string;
}

function renderTermTypes(types?: string[]) {
  const source = Utils.sanitizeArray(types).filter(
    (t) =>
      t !== VocabularyUtils.TERM &&
      !t.startsWith(SKOS.namespace) &&
      !t.startsWith(OWL.namespace)
  );

  if (source.length === 0) {
    return null;
  }

  const renderItem = (item: string) =>
    Utils.isLink(item) ? (
      <OutgoingLink iri={item} label={<AssetLabel iri={item} />} />
    ) : (
      <p>{item}</p>
    );

  if (source.length === 1) {
    return renderItem(source[0]);
  } else {
    return (
      <List type="unstyled" id="term-metadata-types" className="mb-3">
        {source.map((item: string) => (
          <li key={item}>{renderItem(item)}</li>
        ))}
      </List>
    );
  }
}

function renderTermList(
  id: string,
  language: string,
  label: string,
  items?: (Term | TermInfo)[],
  vocabularyIri?: string
) {
  items = Utils.sanitizeArray(items);
  items.sort(termComparator);
  return (
    <TermList
      id={id}
      terms={items}
      language={language}
      label={label}
      vocabularyIri={vocabularyIri}
    />
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
          {renderTermTypes(term.types)}
        </Col>
      </Row>
      {renderTermList(
        "term-metadata-exactmatches",
        language,
        i18n("term.metadata.exactMatches"),
        term.exactMatchTerms,
        term.vocabulary?.iri
      )}
      {renderTermList(
        "term-metadata-parentterms",
        language,
        i18n("term.metadata.parent"),
        term.parentTerms,
        term.vocabulary?.iri
      )}
      {renderTermList(
        "term-metadata-subterms",
        language,
        i18n("term.metadata.subTerms"),
        term.subTerms,
        term.vocabulary?.iri
      )}
      <RelatedTermsList term={term} language={language} />
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
        <TermStatus term={term} vocabulary={vocabulary} />
      </Row>
    </>
  );
};

BasicTermMetadata.defaultProps = {
  withDefinitionSource: false,
};

export default BasicTermMetadata;

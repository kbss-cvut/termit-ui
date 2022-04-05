import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { termInfoComparator } from "../../model/Term";
import { injectIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
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
import DraftToggle from "./DraftToggle";

interface BasicTermMetadataProps extends HasI18n {
  term: Term;
  withDefinitionSource?: boolean;
  language: string;
}

export class BasicTermMetadata extends React.Component<
  BasicTermMetadataProps,
  any
> {
  public static defaultProps: Partial<BasicTermMetadataProps> = {
    withDefinitionSource: false,
  };

  public render() {
    const { i18n, term, language } = this.props;
    return (
      <>
        <TermDefinitionBlock
          term={term}
          language={language}
          withDefinitionSource={this.props.withDefinitionSource}
        />
        <Row>
          <Col xl={2} md={4}>
            <Label className="attribute-label mb-3">
              {i18n("term.metadata.types")}
            </Label>
          </Col>
          <Col xl={10} md={8}>
            {this.renderTypes()}
          </Col>
        </Row>
        {this.renderExactMatchTerms()}
        {this.renderParentTerms()}
        {this.renderSubTerms()}
        <RelatedTermsList term={term} language={language} />
        <Row>
          <Col xl={2} md={4}>
            <Label className="attribute-label mb-3">
              {i18n("term.metadata.comment")}
            </Label>
          </Col>
          <Col xl={10} md={8}>
            <p id="term-metadata-comment">
              <ReactMarkdown>
                {getLocalizedOrDefault(term.scopeNote, "", language)}
              </ReactMarkdown>
            </p>
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
          <Col xl={2} md={4}>
            <Label className="attribute-label align-middle">
              {i18n("term.metadata.status")}
            </Label>
          </Col>
          <Col xl={10} md={8}>
            <DraftToggle
              id="term-metadata-status"
              draft={Term.isDraft(term)}
              onToggle={() => {}}
            />
          </Col>
        </Row>
      </>
    );
  }

  private renderTypes() {
    // Ensures that the implicit TERM type is not rendered
    const types = this.props.term.types;
    return BasicTermMetadata.renderItems(
      Utils.sanitizeArray(types).filter(
        (t) =>
          t !== VocabularyUtils.TERM &&
          !t.startsWith(SKOS.namespace) &&
          !t.startsWith(OWL.namespace)
      ),
      "term-metadata-types"
    );
  }

  private static renderItems(
    items: string[] | string | undefined,
    containerId?: string
  ) {
    const source = Utils.sanitizeArray(items);
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
        <List type="unstyled" id={containerId} className="mb-3">
          {source.map((item: string) => (
            <li key={item}>{renderItem(item)}</li>
          ))}
        </List>
      );
    }
  }

  private renderExactMatchTerms() {
    const exactMatchTerms = Utils.sanitizeArray(
      this.props.term.exactMatchTerms
    );
    exactMatchTerms.sort(termInfoComparator);
    return (
      <TermList
        id={"term-metadata-exactmatches"}
        terms={exactMatchTerms}
        language={this.props.language}
        label={this.props.i18n("term.metadata.exactMatches")}
        vocabularyIri={this.props.term.vocabulary?.iri}
      />
    );
  }

  private renderParentTerms() {
    const parents = Utils.sanitizeArray(this.props.term.parentTerms);
    parents.sort(Utils.labelComparator);
    return (
      <TermList
        id={"term-metadata-parentterms"}
        terms={parents}
        language={this.props.language}
        label={this.props.i18n("term.metadata.parent")}
        vocabularyIri={this.props.term.vocabulary?.iri}
      />
    );
  }

  private renderSubTerms() {
    const source = Utils.sanitizeArray(this.props.term.subTerms);
    source.sort(termInfoComparator);
    return (
      <TermList
        id={"term-metadata-subterms"}
        terms={source}
        language={this.props.language}
        label={this.props.i18n("term.metadata.subTerms")}
        vocabularyIri={this.props.term.vocabulary?.iri}
      />
    );
  }
}

export default injectIntl(withI18n(BasicTermMetadata));

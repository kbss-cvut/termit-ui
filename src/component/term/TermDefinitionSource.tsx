import * as React from "react";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import Utils from "../../util/Utils";
// @ts-ignore
import { Col, Label, List } from "reactstrap";
import OutgoingLink from "../misc/OutgoingLink";
import AssetLabel from "../misc/AssetLabel";
import TermDefinitionSourceLink from "./TermDefinitionSourceLink";
import { TermDefinitionBlockProps } from "./TermDefinitionBlock";
import { useI18n } from "../hook/useI18n";

function renderDefinitionSourceLink(props: TermDefinitionBlockProps) {
  const { term, withDefinitionSource } = props;
  return withDefinitionSource && term.definitionSource ? (
    <TermDefinitionSourceLink term={term} />
  ) : null;
}

const TermDefinitionSource: React.FC<TermDefinitionBlockProps> = (props) => {
  const { i18n } = useI18n();
  const { language, term } = props;
  const definitionText = getLocalizedOrDefault(term.definition, "", language);
  const sources = Utils.sanitizeArray(term.sources);
  if (definitionText.length === 0 && sources.length > 0) {
    return (
      <>
        <Col xl={2} md={4}>
          <Label className="attribute-label definition">
            {i18n("term.metadata.source")}
          </Label>
        </Col>
        <Col xl={10} md={8}>
          <List type="unstyled" className="mb-0">
            {sources.map((s) => (
              <React.Fragment key={s}>
                {Utils.isLink(s) ? (
                  <OutgoingLink
                    key={s}
                    iri={s}
                    label={<AssetLabel iri={s} />}
                  />
                ) : (
                  <>{s}</>
                )}
                {renderDefinitionSourceLink(props)}
              </React.Fragment>
            ))}
          </List>
        </Col>
      </>
    );
  } else {
    return (
      <Col xs={12}>
        {sources.length > 0 ? (
          <footer className="blockquote-footer mb-1 term-metadata-definition-source">
            {sources.map((s) => {
              return (
                <React.Fragment key={s}>
                  <cite
                    key={s}
                    title={i18n("term.metadata.definitionSource.title")}
                  >
                    {Utils.isLink(s) ? (
                      <OutgoingLink iri={s} label={<AssetLabel iri={s} />} />
                    ) : (
                      <>{s}</>
                    )}
                  </cite>
                  {renderDefinitionSourceLink(props)}
                </React.Fragment>
              );
            })}
          </footer>
        ) : (
          renderDefinitionSourceLink(props)
        )}
      </Col>
    );
  }
};

export default TermDefinitionSource;

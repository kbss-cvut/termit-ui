import * as React from "react";
import { TermData } from "../../model/Term";
import { Col, Row } from "reactstrap";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import { useI18n } from "../hook/useI18n";
import MultilingualIcon from "../misc/MultilingualIcon";
import MarkdownEditor from "../misc/MarkdownEditor";
import Constants from "../../util/Constants";

interface TermScopeNoteEditProps {
  term: TermData;
  language: string;
  onChange: (change: Partial<TermData>) => void;
}

export const TermScopeNoteEdit: React.FC<TermScopeNoteEditProps> = (props) => {
  const { term, language, onChange } = props;
  const { i18n } = useI18n();
  const onTextChange = (value: string) => {
    const change = {};
    change[language] = value;
    onChange({ scopeNote: Object.assign({}, term.scopeNote, change) });
  };
  return (
    <>
      <Row>
        <Col xs={12}>
          <MarkdownEditor
            name="create-term-comment"
            label={
              <>
                {i18n("term.metadata.comment")}
                <MultilingualIcon id="create-term-comment-multilingual" />
              </>
            }
            labelClass="attribute-label"
            value={getLocalizedOrDefault(term.scopeNote, "", language)}
            help={i18n("term.comment.help")}
            maxHeight={Constants.MARKDOWN_EDITOR_HEIGHT}
            onChange={onTextChange}
            renderMarkdownHint={true}
          />
        </Col>
      </Row>
    </>
  );
};

export default TermScopeNoteEdit;

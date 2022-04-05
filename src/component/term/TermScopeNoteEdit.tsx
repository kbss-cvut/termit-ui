import * as React from "react";
import { TermData } from "../../model/Term";
import { Col, Row } from "reactstrap";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import { useI18n } from "../hook/useI18n";
import MultilingualIcon from "../misc/MultilingualIcon";
import MarkdownEditor from "../misc/MarkdownEditor";
import Constants from "../../util/Constants";
import FormValidationResult from "../../model/form/ValidationResult";
import ValidationResult from "../../model/ValidationResult";
import Utils from "../../util/Utils";

interface TermScopeNoteEditProps {
  term: TermData;
  language: string;
  onChange: (change: Partial<TermData>) => void;
  validationResult?: ValidationResult[];
}

export const TermScopeNoteEdit: React.FC<TermScopeNoteEditProps> = (props) => {
  const { term, language, onChange, validationResult } = props;
  const { i18n, locale } = useI18n();
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
            name="term-comment-edit"
            label={
              <>
                {i18n("term.metadata.comment")}
                <MultilingualIcon id="term-comment-edit-multilingual" />
              </>
            }
            labelClass="attribute-label"
            value={getLocalizedOrDefault(term.scopeNote, "", language)}
            help={i18n("term.comment.help")}
            maxHeight={Constants.MARKDOWN_EDITOR_HEIGHT}
            onChange={onTextChange}
            renderMarkdownHint={true}
            validation={Utils.sanitizeArray(validationResult).map((vr) =>
              FormValidationResult.fromOntoValidationResult(vr, locale)
            )}
          />
        </Col>
      </Row>
    </>
  );
};

export default TermScopeNoteEdit;

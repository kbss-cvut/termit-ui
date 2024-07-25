import * as React from "react";
import { injectIntl } from "react-intl";
import Vocabulary, { CONTEXT } from "../../model/Vocabulary";
import withI18n, { HasI18n } from "../hoc/withI18n";
import {
  Button,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Form,
  Row,
} from "reactstrap";
import CustomInput from "../misc/CustomInput";
import UnmappedPropertiesEdit from "../genericmetadata/UnmappedPropertiesEdit";
import VocabularyUtils from "../../util/VocabularyUtils";
import ImportedVocabulariesListEdit from "./ImportedVocabulariesListEdit";
import { AssetData } from "../../model/Asset";
import MarkdownEditor from "../misc/MarkdownEditor";
import Constants from "../../util/Constants";
import Document from "../../model/Document";
import MultilingualString, {
  getLocalizedOrDefault,
  langString,
} from "../../model/MultilingualString";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import _ from "lodash";
import { isValid } from "./VocabularyValidationUtils";

interface VocabularyEditProps extends HasI18n {
  vocabulary: Vocabulary;
  save: (vocabulary: Vocabulary) => void;
  cancel: () => void;
  saveDocument: (document: Document) => void;
  language: string;
  selectLanguage: (lang: string) => void;
}

interface VocabularyEditState {
  label: MultilingualString;
  comment: MultilingualString;
  importedVocabularies?: AssetData[];
  unmappedProperties: Map<string, string[]>;
  documentLabel: string;
}

export class VocabularyEdit extends React.Component<
  VocabularyEditProps,
  VocabularyEditState
> {
  constructor(props: VocabularyEditProps) {
    super(props);
    this.state = {
      label: props.vocabulary.label,
      comment:
        props.vocabulary.comment !== undefined
          ? this.props.vocabulary.comment!
          : langString("", props.language),
      documentLabel: this.props.vocabulary.document?.label!,
      importedVocabularies: this.props.vocabulary.importedVocabularies,
      unmappedProperties: this.props.vocabulary.unmappedProperties,
    };
  }

  public onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = Object.assign({}, this.state.label);
    label[this.props.language] = e.currentTarget.value;
    this.setState({ label });
  };

  public onCommentChange = (value: string) => {
    const comment = Object.assign({}, this.state.comment);
    comment[this.props.language] = value;
    this.setState({ comment });
  };

  public onChange = (change: object) => {
    this.setState(change);
  };

  private onPropertiesChange = (newProperties: Map<string, string[]>) => {
    this.setState({ unmappedProperties: newProperties });
  };

  public removeTranslation = (lang: string) => {
    const data = _.cloneDeep({
      label: this.state.label,
      comment: this.state.comment,
    });
    Vocabulary.removeTranslation(data, lang);
    this.setState({ ...data });
  };

  public onSave = () => {
    const modifiedDocument = Object.assign({}, this.props.vocabulary.document, {
      label: this.state.documentLabel?.trim(),
    });

    const newVocabulary = new Vocabulary(
      Object.assign({}, this.props.vocabulary, {
        label: this.state.label,
        comment: this.state.comment,
        importedVocabularies: this.state.importedVocabularies,
      })
    );
    newVocabulary.unmappedProperties = this.state.unmappedProperties;
    if (modifiedDocument.label !== this.props.vocabulary.document?.label)
      this.props.saveDocument(modifiedDocument);
    this.props.save(newVocabulary);
  };

  public render() {
    const i18n = this.props.i18n;
    const language = this.props.language;
    return (
      <>
        <EditLanguageSelector
          key="vocabulary-edit-language-selector"
          language={language}
          existingLanguages={Vocabulary.getLanguages(this.state)}
          onSelect={this.props.selectLanguage}
          onRemove={this.removeTranslation}
        />
        <Card>
          <CardBody>
            <Form>
              <Row>
                <Col xs={12}>
                  <CustomInput
                    name="edit-vocabulary-iri"
                    label={i18n("asset.iri")}
                    value={this.props.vocabulary.iri}
                    disabled={true}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <CustomInput
                    name="edit-vocabulary-label"
                    label={i18n("asset.label")}
                    value={getLocalizedOrDefault(
                      this.state.label,
                      "",
                      language
                    )}
                    onChange={this.onLabelChange}
                    hint={i18n("required")}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <MarkdownEditor
                    name="edit-vocabulary-comment"
                    label={i18n("vocabulary.comment")}
                    value={getLocalizedOrDefault(
                      this.state.comment,
                      "",
                      language
                    )}
                    onChange={this.onCommentChange}
                    renderMarkdownHint={true}
                    maxHeight={Constants.MARKDOWN_EDITOR_HEIGHT}
                  />
                </Col>
              </Row>
              <ImportedVocabulariesListEdit
                vocabulary={this.props.vocabulary}
                importedVocabularies={this.state.importedVocabularies}
                onChange={this.onChange}
              />
              <Row>
                <Col xs={12}>
                  <UnmappedPropertiesEdit
                    properties={this.state.unmappedProperties}
                    ignoredProperties={VocabularyEdit.mappedPropertiesToIgnore()}
                    onChange={this.onPropertiesChange}
                    languages={Vocabulary.getLanguages(this.props.vocabulary)}
                    language={language}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <CustomInput
                    name="edit-document-label"
                    label={i18n("vocabulary.document.set.label")}
                    value={this.state.documentLabel}
                    onChange={(e) =>
                      this.onChange({ documentLabel: e.currentTarget.value })
                    }
                    hint={i18n("required")}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <ButtonToolbar className="d-flex justify-content-center mt-4">
                    <Button
                      id="edit-vocabulary-submit"
                      onClick={this.onSave}
                      color="success"
                      size="sm"
                      disabled={
                        !isValid(this.state.label) ||
                        this.state.documentLabel?.trim().length === 0
                      }
                    >
                      {i18n("save")}
                    </Button>
                    <Button
                      id="edit-vocabulary-cancel"
                      onClick={this.props.cancel}
                      color="outline-dark"
                      size="sm"
                    >
                      {i18n("cancel")}
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>
      </>
    );
  }

  private static mappedPropertiesToIgnore() {
    const toIgnore = Object.getOwnPropertyNames(CONTEXT).map((n) => CONTEXT[n]);
    toIgnore.push(VocabularyUtils.RDF_TYPE);
    return toIgnore;
  }
}

export default injectIntl(withI18n(VocabularyEdit));

import React, { useState } from "react";
import {
  getLocalized,
  getLocalizedOrDefault,
  langString,
} from "../../model/MultilingualString";
import Vocabulary from "../../model/Vocabulary";
import TermItFile from "../../model/File";
import { Button, ButtonToolbar, Card, CardBody, Col, Row } from "reactstrap";
import CustomInput from "../misc/CustomInput";
import MarkdownEditor from "../misc/MarkdownEditor";
import Constants from "../../util/Constants";
import ShowAdvanceAssetFields from "../asset/ShowAdvancedAssetFields";
import Files from "../resource/document/Files";
import AddFile from "../resource/document/AddFile";
import RemoveFile from "../resource/document/RemoveFile";
import { useI18n } from "../hook/useI18n";
import { loadIdentifier } from "../asset/CreateAssetUtils";
import { isValid } from "./VocabularyValidationUtils";
import VocabularyUtils from "../../util/VocabularyUtils";
import Document from "../../model/Document";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import _ from "lodash";

interface CreateVocabularyFormProps {
  onSave: (
    vocabulary: Vocabulary,
    files: TermItFile[],
    fileContents: File[]
  ) => void;
  onCancel: () => void;
  language: string;
  selectLanguage: (lang: string) => void;
}

function generateIri(
  label: string,
  shouldGenerate: boolean,
  handler: (iri: string) => void
) {
  if (!shouldGenerate || label.trim().length === 0) {
    return;
  }
  loadIdentifier({ name: label, assetType: "VOCABULARY" }).then((resp) =>
    handler(resp.data)
  );
}

const CreateVocabularyForm: React.FC<CreateVocabularyFormProps> = ({
  onSave,
  onCancel,
  language,
  selectLanguage,
}) => {
  const { i18n, formatMessage } = useI18n();
  const [iri, setIri] = useState<string>("");
  const [label, setLabel] = useState(langString("", language));
  const [comment, setComment] = useState(langString("", language));
  const [files, setFiles] = useState<TermItFile[]>([]);
  const [fileContents, setFileContents] = useState<File[]>([]);
  const [documentLabel, setDocumentLabel] = useState("");
  const [shouldGenerateIri, setShouldGenerateIri] = useState(true);

  const onIriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim().length === 0) {
      return;
    }
    setIri(e.currentTarget.value);
    setShouldGenerateIri(false);
  };
  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = Object.assign({}, label);
    newLabel[language] = e.currentTarget.value;
    setLabel(newLabel);
    generateIri(e.currentTarget.value, shouldGenerateIri, setIri);
  };
  const onCommentChange = (value: string) => {
    const newComment = Object.assign({}, comment);
    newComment[language] = value;
    setComment(newComment);
  };
  const onCreateFile = async (file: TermItFile, content: File) => {
    await Promise.resolve();
    setFiles([...files, file]);
    setFileContents([...fileContents, content]);
  };
  const onRemoveFile = async (file: TermItFile) => {
    return Promise.resolve().then(() => {
      const index = files.indexOf(file);
      if (index > -1) {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        const newContents = [...fileContents];
        newContents.splice(index, 1);
        setFiles(newFiles);
        setFileContents(newContents);
      }
    });
  };
  const onSubmit = () => {
    const vocabulary = new Vocabulary({
      iri,
      label,
      comment,
    });
    vocabulary.addType(VocabularyUtils.DOCUMENT_VOCABULARY);
    const document = new Document({
      label:
        documentLabel.trim() === ""
          ? formatMessage("vocabulary.document.label", {
              vocabulary: getLocalized(label, language),
            })
          : documentLabel.trim(),
      iri: iri + "/document",
      files: [],
    });
    document.addType(VocabularyUtils.DOCUMENT);
    vocabulary.document = document;
    onSave(vocabulary, files, fileContents);
  };
  const removeTranslation = (lang: string) => {
    const data = _.cloneDeep({ label, comment });
    Vocabulary.removeTranslation(data, lang);
    setLabel(data.label);
    setComment(data.comment);
  };

  return (
    <>
      <EditLanguageSelector
        language={language}
        existingLanguages={Vocabulary.getLanguages({ label, comment })}
        onSelect={selectLanguage}
        onRemove={removeTranslation}
      />
      <Card id="create-vocabulary">
        <CardBody>
          <Row>
            <Col xs={12}>
              <Row>
                <Col xs={12}>
                  <CustomInput
                    name="create-vocabulary-label"
                    label={i18n("asset.label")}
                    value={getLocalizedOrDefault(label, "", language)}
                    hint={i18n("required")}
                    onChange={onLabelChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <MarkdownEditor
                    name="create-vocabulary-comment"
                    label={i18n("vocabulary.comment")}
                    value={getLocalizedOrDefault(comment, "", language)}
                    onChange={onCommentChange}
                    maxHeight={Constants.MARKDOWN_EDITOR_HEIGHT}
                    renderMarkdownHint={true}
                  />
                </Col>
              </Row>
              <ShowAdvanceAssetFields>
                <Row>
                  <Col xs={12}>
                    <CustomInput
                      name="create-vocabulary-iri"
                      label={i18n("asset.iri")}
                      value={iri}
                      onChange={onIriChange}
                      help={i18n("asset.create.iri.help")}
                    />
                  </Col>
                </Row>
              </ShowAdvanceAssetFields>
              <Row>
                <Col xs={12}>
                  <CustomInput
                    name="edit-document-label"
                    label={i18n("vocabulary.document.set.label")}
                    value={documentLabel}
                    onChange={(e) => setDocumentLabel(e.currentTarget.value)}
                  />
                </Col>
              </Row>
              <Files
                files={files}
                actions={[
                  <AddFile key="add-file" performAction={onCreateFile} />,
                ]}
                itemActions={(file: TermItFile) => [
                  <RemoveFile
                    key="remove-file"
                    file={file}
                    performAction={() => onRemoveFile(file)}
                    withConfirmation={false}
                  />,
                ]}
              />
              <Row>
                <Col xs={12}>
                  <ButtonToolbar className="d-flex justify-content-center mt-4">
                    <Button
                      id="create-vocabulary-submit"
                      onClick={onSubmit}
                      color="success"
                      size="sm"
                      disabled={!isValid(label)}
                    >
                      {i18n("vocabulary.create.submit")}
                    </Button>
                    <Button
                      id="create-vocabulary-cancel"
                      onClick={onCancel}
                      color="outline-dark"
                      size="sm"
                    >
                      {i18n("cancel")}
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
};

export default CreateVocabularyForm;

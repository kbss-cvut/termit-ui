import * as React from "react";
import { useState } from "react";
import { RdfsResourceData } from "../../model/RdfsResource";
import {
  Button,
  ButtonToolbar,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import CustomInput from "../misc/CustomInput";
import VocabularyUtils from "../../util/VocabularyUtils";
import { useI18n } from "../hook/useI18n";
import TextArea from "../misc/TextArea";
import MultilingualString from "../../model/MultilingualString";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import MultilingualIcon from "../misc/MultilingualIcon";

interface CreatePropertyFormProps {
  onOptionCreate: (option: RdfsResourceData) => void;
  toggleModal: () => void;
  languages: string[];
  language: string;
}

function isValid(data: { iri: string }) {
  // "http://".length => 7
  return data.iri.length > 7;
}

const CreatePropertyForm: React.FC<CreatePropertyFormProps> = ({
  onOptionCreate,
  toggleModal,
  languages,
  language,
}) => {
  const { i18n } = useI18n();
  const [iri, setIri] = useState("");
  const [label, setLabel] = useState({} as MultilingualString);
  const [comment, setComment] = useState({} as MultilingualString);
  const [modalLanguages, setModalLanguages] = useState([...languages]);
  const [modalLanguage, setModalLanguage] = useState(language);
  const onCreate = () => {
    toggleModal();
    const newProperty: RdfsResourceData = {
      iri,
      label,
      comment,
      types: [VocabularyUtils.RDF_PROPERTY],
    };
    onOptionCreate(newProperty);
  };

  const setMultilingualString = (
    str: MultilingualString,
    setter: (value: MultilingualString) => void,
    value: string
  ) => {
    const copy = Object.assign({}, str);
    copy[modalLanguage] = value;
    setter(copy);
  };

  const removeTranslation = (lang: string) => {
    const newLabel = Object.assign({}, label);
    delete newLabel[lang];
    setLabel(newLabel);

    const newComment = Object.assign({}, comment);
    delete newComment[language];
    setComment(newComment);

    const newModalLanguages = modalLanguages.filter((l) => l !== lang);
    setModalLanguages(newModalLanguages);
  };

  const withMultilingualIcon = (text: string) => (
    <>
      {text}
      <MultilingualIcon id={"string-list-edit-multilingual" + Date.now()} />
    </>
  );

  return (
    <Modal isOpen={true}>
      <ModalHeader toggle={toggleModal}>
        {i18n("properties.edit.new")}
      </ModalHeader>
      <ModalBody>
        <Row>
          <EditLanguageSelector
            key="vocabulary-edit-language-selector"
            language={modalLanguage}
            existingLanguages={modalLanguages}
            onSelect={setModalLanguage}
            onRemove={removeTranslation}
          />
        </Row>
        <Row>
          <Col xs={12}>
            <CustomInput
              name="iri"
              label={i18n("properties.edit.new.iri")}
              value={iri}
              onChange={(e) => setIri(e.currentTarget.value)}
              hint={i18n("required")}
            />
          </Col>
          <Col xs={12}>
            <CustomInput
              name="label"
              label={withMultilingualIcon(i18n("properties.edit.new.label"))}
              value={label[modalLanguage] || ""}
              onChange={(e) =>
                setMultilingualString(label, setLabel, e.currentTarget.value)
              }
              hint={i18n("required")}
            />
          </Col>
          <Col xs={12}>
            <TextArea
              rows={3}
              name="comment"
              label={withMultilingualIcon(i18n("properties.edit.new.comment"))}
              value={comment[modalLanguage] || ""}
              onChange={(e) =>
                setMultilingualString(
                  comment,
                  setComment,
                  e.currentTarget.value
                )
              }
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <ButtonToolbar className="float-right">
              <Button
                id="create-property-submit"
                color="success"
                size="sm"
                onClick={onCreate}
                disabled={!isValid({ iri })}
              >
                {i18n("save")}
              </Button>
              <Button
                id="create-property-cancel"
                color="outline-dark"
                size="sm"
                onClick={toggleModal}
              >
                {i18n("cancel")}
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};
export default CreatePropertyForm;

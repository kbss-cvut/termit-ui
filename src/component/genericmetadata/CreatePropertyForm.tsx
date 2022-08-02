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

interface CreatePropertyFormProps {
  onOptionCreate: (option: RdfsResourceData) => void;
  toggleModal: () => void;
}

function isValid(data: RdfsResourceData) {
  // "http://".length => 7
  return data.iri.length > 7;
}

const CreatePropertyForm: React.FC<CreatePropertyFormProps> = ({
  onOptionCreate,
  toggleModal,
}) => {
  const { i18n } = useI18n();
  const [iri, setIri] = useState("");
  const [label, setLabel] = useState("");
  const [comment, setComment] = useState("");
  const onCreate = () => {
    toggleModal();
    const newProperty: RdfsResourceData = {
      iri,
      label: label!.length > 0 ? label : undefined,
      comment: comment!.length > 0 ? comment : undefined,
      types: [VocabularyUtils.RDF_PROPERTY],
    };
    onOptionCreate(newProperty);
  };

  return (
    <Modal isOpen={true}>
      <ModalHeader toggle={toggleModal}>
        {i18n("properties.edit.new")}
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col xs={12}>
            <CustomInput
              name="iri"
              label={i18n("properties.edit.new.iri")}
              onChange={(e) => setIri(e.currentTarget.value)}
              hint={i18n("required")}
            />
          </Col>
          <Col xs={12}>
            <CustomInput
              name="label"
              label={i18n("properties.edit.new.label")}
              onChange={(e) => setLabel(e.currentTarget.value)}
              hint={i18n("required")}
            />
          </Col>
          <Col xs={12}>
            <TextArea
              rows={3}
              name="comment"
              label={i18n("properties.edit.new.comment")}
              onChange={(e) => setComment(e.currentTarget.value)}
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
                disabled={!isValid({ iri, label, comment })}
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

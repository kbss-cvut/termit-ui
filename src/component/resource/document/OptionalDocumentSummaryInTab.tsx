import * as React from "react";
import { useState } from "react";
import Document from "../../../model/Document";
import DocumentSummaryInTab from "./DocumentSummaryInTab";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import DocumentList from "../DocumentList";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Vocabulary from "../../../model/Vocabulary";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { loadResource, updateVocabulary } from "../../../action/AsyncActions";
import { GoX } from "react-icons/go";
import classNames from "classnames";
import CreateResourceForm from "../CreateResourceForm";
import IfUserAuthorized from "../../authorization/IfUserAuthorized";
import { useI18n } from "../../hook/useI18n";

interface OptionalDocumentSummaryInTabProps {
  vocabulary: Vocabulary;
  onChange: () => void;

  loadDocument: (iri: IRI) => Promise<Document | null>;
  updateVocabulary: (vocabulary: Vocabulary) => Promise<any>;
}

export const OptionalDocumentSummaryInTab: React.FC<OptionalDocumentSummaryInTabProps> = (
  props
) => {
  const { i18n } = useI18n();
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const toggleAttach = () => setIsAttachOpen(!isAttachOpen);
  const toggleCreate = () => setIsCreateOpen(!isCreateOpen);

  if (props.vocabulary.document) {
    const onVocabularyDocumentRemove = () => {
      const document = props.vocabulary.document;
      delete props.vocabulary.document!.vocabulary;
      delete props.vocabulary.document;
      props
        .updateVocabulary(props.vocabulary)
        .then(() => props.loadDocument(VocabularyUtils.create(document?.iri!)));
    };

    return (
      <div className={classNames("card-header")}>
        <div />
        <IfUserAuthorized renderUnauthorizedAlert={false}>
          <Button
            color="outline-muted"
            className="float-right"
            size="sm"
            title={i18n("vocabulary.document.remove")}
            onClick={onVocabularyDocumentRemove}
          >
            <GoX />
            &nbsp;{i18n("vocabulary.document.remove")}
          </Button>
        </IfUserAuthorized>
        &nbsp;
        <DocumentSummaryInTab
          resource={props.vocabulary.document}
          onChange={props.onChange}
        />
      </div>
    );
  } else {
    const onVocabularyDocumentSet = (document: Document) => {
      props.vocabulary.document = document;
      // to avoid circular dependencies
      props.vocabulary.document.files.forEach((f) => delete f.owner);
      return props
        .updateVocabulary(props.vocabulary)
        .then(() => props.loadDocument(VocabularyUtils.create(document.iri!)));
    };

    const onSelected = (document: Document) => {
      return onVocabularyDocumentSet(document).then(toggleAttach);
    };

    const onCreated = (iri: string) => {
      props
        .loadDocument(VocabularyUtils.create(iri))
        .then((document) => {
          if (document) {
            onVocabularyDocumentSet(document);
          }
        })
        .then(toggleCreate);
    };

    return (
      <div
        className={classNames(
          "card-header",
          "d-flex",
          "justify-content-between"
        )}
      >
        <div />
        <div>
          <Modal isOpen={isAttachOpen} toggle={toggleAttach}>
            <ModalHeader>
              {i18n("vocabulary.document.select.title")}
            </ModalHeader>
            <ModalBody>
              <DocumentList onSelected={onSelected} />
            </ModalBody>
          </Modal>
          <Modal isOpen={isCreateOpen} toggle={toggleCreate}>
            <ModalHeader>
              {i18n("vocabulary.document.create.title")}
            </ModalHeader>
            <ModalBody>
              <CreateResourceForm
                onCancel={toggleCreate}
                onSuccess={onCreated}
                justDocument={true}
              />
            </ModalBody>
          </Modal>
        </div>
        <div>
          <Button
            color="primary"
            title={i18n("vocabulary.document.create")}
            size="sm"
            onClick={toggleCreate}
          >
            {i18n("vocabulary.document.create")}
          </Button>
          <Button
            color="primary"
            title={i18n("vocabulary.document.select")}
            size="sm"
            onClick={toggleAttach}
          >
            {i18n("vocabulary.document.select")}
          </Button>
        </div>
      </div>
    );
  }
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    loadDocument: (iri: IRI) =>
      dispatch(loadResource(iri)) as Promise<Document | null>,
    updateVocabulary: (vocabulary: Vocabulary) =>
      dispatch(updateVocabulary(vocabulary)),
  };
})(OptionalDocumentSummaryInTab);

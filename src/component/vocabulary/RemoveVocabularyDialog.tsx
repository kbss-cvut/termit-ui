import { useI18n } from "../hook/useI18n";
import Utils from "../../util/Utils";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { Col, Label, Row } from "reactstrap";
import Vocabulary from "../../model/Vocabulary";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getVocabularyRelations,
  getVocabularyTermsRelations,
} from "../../action/AsyncVocabularyActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import { ThunkDispatch } from "../../util/Types";
import RDFStatement from "../../model/RDFStatement";
import { trackPromise } from "react-promise-tracker";
import "./RemoveVocabularyDialog.scss";
import AssetLabel from "../misc/AssetLabel";
import CopyIriIcon from "../misc/CopyIriIcon";
import TermIriLink from "../term/TermIriLink";
import VocabularyIriLink from "./VocabularyIriLink";
import CustomInput from "../misc/CustomInput";
import * as React from "react";
import ValidationResult from "../../model/form/ValidationResult";
import If from "../misc/If";

interface RemoveVocabularyDialogProps {
  show: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  vocabulary: Vocabulary;
}

const TRACKING_PROMISE_AREA = "vocabulary-remove-dialog";
const b = (chunks: any) => <b>{chunks}</b>;

const RemoveVocabularyDialog: React.FC<RemoveVocabularyDialogProps> = (
  props
) => {
  const { i18n, formatMessage, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const typeLabelId = Utils.getAssetTypeLabelId(props.vocabulary);
  const typeLabel = i18n(typeLabelId || "type.asset").toLowerCase();

  const [vocabularyRelations, setVocabularyRelations] = useState<
    RDFStatement[]
  >([]);
  const [termsRelations, setTermsRelations] = useState<RDFStatement[]>([]);
  const [confirmationVocabularyName, setconfirmationVocabularyName] =
    useState("");

  const canRemoveSilently = props.vocabulary.termCount === 0;

  const canRemove =
    vocabularyRelations.length === 0 && termsRelations.length === 0;

  useEffect(() => {
    if (!props.show) {
      return;
    }
    setVocabularyRelations([]);
    setTermsRelations([]);
    setconfirmationVocabularyName("");

    const iri = VocabularyUtils.create(props.vocabulary.iri);
    const controller = new AbortController();

    const vocabularyPromise = dispatch(
      getVocabularyRelations(iri, controller)
    ).then(setVocabularyRelations);

    const termsPromise = dispatch(
      getVocabularyTermsRelations(iri, controller)
    ).then(setTermsRelations);

    // track both promises
    trackPromise(
      Promise.all([vocabularyPromise, termsPromise]),
      TRACKING_PROMISE_AREA
    );

    return () => controller.abort();
  }, [props.vocabulary, props.show, dispatch]);

  const submit = () => {
    if (validateInput() !== ValidationResult.VALID && !canRemoveSilently) {
      return;
    }
    props.onSubmit();
  };

  const renderStatementArray = (
    statements: RDFStatement[],
    keyBase: string,
    LinkComponent: typeof VocabularyIriLink | typeof TermIriLink
  ) =>
    statements.map((statement, index) => {
      return (
        <Row key={keyBase + index + "row"}>
          <Col md={4} xs={12}>
            <span id={keyBase + index + "object"}>
              <LinkComponent iri={statement.object.iri} />
            </span>
          </Col>
          <Col md={4} xs={12}>
            <span id={keyBase + index + "relation"}>
              <AssetLabel iri={statement.relation.iri} shrinkFullIri={true} />
              <CopyIriIcon url={statement.relation.iri} />
            </span>
          </Col>
          <Col md={4} xs={12}>
            <span id={keyBase + index + "subject"}>
              <AssetLabel iri={statement.subject.iri} shrinkFullIri={true} />
              <CopyIriIcon url={statement.subject.iri} />
            </span>
          </Col>
        </Row>
      );
    });

  const isConfirmDisabled =
    !canRemoveSilently &&
    (!canRemove ||
      confirmationVocabularyName !== props.vocabulary.getLabel(locale));

  const validateInput = () => {
    return isConfirmDisabled
      ? ValidationResult.BLOCKER
      : ValidationResult.VALID;
  };

  const renderRemoveWarning = () => (
    <>
      <Label>
        {formatMessage(
          "vocabulary.remove.dialog.text." +
            (canRemoveSilently ? "empty" : "nonEmpty"),
          {
            b,
          }
        )}
        <br />
        <b>{i18n("vocabulary.remove.dialog.text.permanent")}</b>
      </Label>

      <If expression={!canRemoveSilently}>
        <p>
          {formatMessage("vocabulary.remove.dialog.text.termCount", {
            b,
            count: props.vocabulary.termCount,
          })}
        </p>
        <CustomInput
          label={i18n("vocabulary.remove.dialog.input.label")}
          value={confirmationVocabularyName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setconfirmationVocabularyName(e.currentTarget.value)
          }
          validation={validateInput()}
        />
      </If>
    </>
  );

  const renderUnableToRemove = () => {
    return (
      <>
        <Label>
          {i18n("vocabulary.remove.dialog.relations.error.cantRemove")}
        </Label>
        <p>
          <If expression={vocabularyRelations.length > 0}>
            {formatMessage(
              "vocabulary.remove.dialog.relations.error.vocabularyRelations",
              { vocabularyRelations: vocabularyRelations.length, b }
            )}
            <br />
          </If>
          <If expression={termsRelations.length > 0}>
            {formatMessage(
              "vocabulary.remove.dialog.relations.error.termsRelations",
              { termsRelations: termsRelations.length, b }
            )}
            <br />
          </If>
        </p>
        <h3>{props.vocabulary.getLabel(locale)}</h3>
        <details>
          <summary>{i18n("vocabulary.remove.dialog.relations")}</summary>
          <ul>
            {renderStatementArray(
              vocabularyRelations,
              "remove-vocabulary-dialog-vocabulary-relation-",
              VocabularyIriLink
            )}
          </ul>
          <ul>
            {renderStatementArray(
              termsRelations,
              "remove-vocabulary-dialog-term-relation-",
              TermIriLink
            )}
          </ul>
        </details>
      </>
    );
  };

  const renderContent = () => {
    if (canRemove) {
      return renderRemoveWarning();
    }
    return renderUnableToRemove();
  };

  return (
    <ConfirmCancelDialog
      show={props.show}
      id="remove-vocabulary-dialog"
      onClose={() => props.onCancel()}
      onConfirm={submit}
      confirmColor={"outline-danger"}
      confirmDisabled={isConfirmDisabled}
      title={formatMessage("asset.remove.dialog.title", {
        type: typeLabel,
        label: props.vocabulary.getLabel(locale),
      })}
      confirmKey="remove"
      size={"lg"}
    >
      <PromiseTrackingMask area="vocabulary-remove-dialog" />
      {renderContent()}
    </ConfirmCancelDialog>
  );
};

export default RemoveVocabularyDialog;

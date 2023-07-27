import React from "react";
import Term from "../../model/Term";
import Vocabulary from "../../model/Vocabulary";
import { useI18n } from "../hook/useI18n";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Label } from "reactstrap";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";
import { loadTermStates } from "../../action/AsyncActions";
import TermItState from "../../model/TermItState";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import { GoCircleSlash, GoPencil } from "react-icons/go";
import TermStateSelector from "./TermStateSelector";
import BadgeButton from "../misc/BadgeButton";
import { setTermState } from "../../action/AsyncTermActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

interface TermStateProps {
  term: Term;
  vocabulary: Vocabulary;
}

const TermState: React.FC<TermStateProps> = ({ term, vocabulary }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadTermStates());
  }, [dispatch]);
  const [editing, setEditing] = React.useState(false);

  return (
    <>
      <Col xl={2} md={4}>
        <Label className="attribute-label mb-3 align-middle">
          {i18n("term.metadata.status")}
        </Label>
      </Col>
      <Col xl={10} md={8}>
        {editing ? (
          <TermStateEditInline term={term} onClose={() => setEditing(false)} />
        ) : (
          <TermStateDisplay
            term={term}
            vocabulary={vocabulary}
            onEdit={() => setEditing(true)}
          />
        )}
      </Col>
    </>
  );
};

export const TermStateDisplay: React.FC<
  TermStateProps & { onEdit: () => void }
> = ({ term, vocabulary, onEdit }) => {
  const { i18n, locale } = useI18n();
  const states = useSelector((state: TermItState) => state.states);
  const selectedState = states[term.state?.iri!];

  return (
    <>
      {selectedState &&
        getLocalized(selectedState.label, getShortLocale(locale))}
      <IfVocabularyActionAuthorized
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.WRITE}
      >
        <BadgeButton
          color="outline-dark"
          onClick={onEdit}
          className="ml-1 align-top"
          title={i18n("edit")}
        >
          <GoPencil />
        </BadgeButton>
      </IfVocabularyActionAuthorized>
    </>
  );
};

const TermStateEditInline: React.FC<{ term: Term; onClose: () => void }> = ({
  term,
  onClose,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const onSelect = (value: string) => {
    trackPromise(
      dispatch(setTermState(VocabularyUtils.create(term.iri), value)),
      "term-state-inline-edit"
    ).then(() => {
      onClose();
    });
  };
  return (
    <div className="d-flex">
      <PromiseTrackingMask area="term-state-inline-edit" />
      <div className="flex-grow-1">
        <TermStateSelector onChange={onSelect} value={term.state} />
      </div>
      <div className="ml-3">
        <Button
          size="sm"
          title={i18n("cancel")}
          onClick={onClose}
          color="outline-dark"
          className="icon-button"
        >
          <GoCircleSlash />
        </Button>
      </div>
    </div>
  );
};

export default TermState;

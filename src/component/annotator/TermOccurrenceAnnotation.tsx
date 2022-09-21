import * as React from "react";
import Term from "../../model/Term";
import AnnotationTerms from "./AnnotationTerms";
import { Button } from "reactstrap";
import { FaCheck } from "react-icons/fa";
import { TiTimes, TiTrash } from "react-icons/ti";
import { AnnotationOrigin } from "./Annotation";
import SimplePopupWithActions from "./SimplePopupWithActions";
import TermOccurrenceAnnotationView from "./TermOccurrenceAnnotationView";
import { GoPencil } from "react-icons/go";
import IfUserIsEditor from "../authorization/IfUserIsEditor";
import { useI18n } from "../hook/useI18n";

interface TermOccurrenceAnnotationProps {
  target: string;
  term?: Term | null;
  score?: string;
  resource?: string;
  text: string;
  annotationClass: string;
  annotationOrigin: string;
  isOpen: boolean;

  onRemove: () => void;
  onSelectTerm: (term: Term | null) => void;
  onCreateTerm: () => void;
  onToggleDetailOpen: () => void;
  onClose: () => void;
}

function createActionButtons(
  props: TermOccurrenceAnnotationProps,
  i18n: (msgId: string) => string,
  editing: boolean,
  onEdit: () => void
) {
  const actions = [];
  const t = props.term ? props.term : null;
  if (props.annotationOrigin === AnnotationOrigin.PROPOSED && t !== null) {
    actions.push(
      <IfUserIsEditor key="annotation.confirm">
        <Button
          color="primary"
          title={i18n("annotation.confirm")}
          size="sm"
          onClick={() => props.onSelectTerm(t)}
        >
          <FaCheck />
        </Button>
      </IfUserIsEditor>
    );
  }
  if (!editing) {
    actions.push(
      <IfUserIsEditor key="annotation.edit">
        <Button
          color="primary"
          title={i18n("annotation.edit")}
          size="sm"
          onClick={onEdit}
        >
          <GoPencil />
        </Button>
      </IfUserIsEditor>
    );
  }
  actions.push(
    <IfUserIsEditor key="annotation.remove">
      <Button
        color="primary"
        title={i18n("annotation.remove")}
        size="sm"
        onClick={props.onRemove}
      >
        <TiTrash />
      </Button>
    </IfUserIsEditor>
  );
  actions.push(
    <Button
      key="annotation.close"
      color="primary"
      title={i18n("annotation.close")}
      size="sm"
      onClick={props.onClose}
    >
      <TiTimes />
    </Button>
  );
  return actions;
}

export const TermOccurrenceAnnotation: React.FC<TermOccurrenceAnnotationProps> =
  (props) => {
    const { i18n } = useI18n();
    const term = props.term !== undefined ? props.term : null;
    const [editing, setEditing] = React.useState(term === null);
    React.useEffect(() => {
      if (term) {
        setEditing(false);
      }
    }, [term]);
    const onClose = () => {
      setEditing(false);
      props.onClose();
    };
    const popupBody = editing ? (
      <AnnotationTerms
        selectedTerm={term}
        onChange={props.onSelectTerm}
        onCreateTerm={props.onCreateTerm}
      />
    ) : (
      <TermOccurrenceAnnotationView
        term={term}
        score={props.score}
        resource={props.resource}
        annotationClass={props.annotationClass}
      />
    );

    return (
      <SimplePopupWithActions
        isOpen={props.isOpen}
        target={props.target}
        toggle={props.onToggleDetailOpen}
        component={popupBody}
        actions={createActionButtons(
          Object.assign({}, props, {
            onSelectTerm: props.onSelectTerm,
            onClose,
          }),
          i18n,
          editing,
          () => setEditing(!editing)
        )}
        title={i18n("annotation.occurrence.title")}
      />
    );
  };

export default TermOccurrenceAnnotation;

import * as React from "react";
import Term from "../../model/Term";
import { Button } from "reactstrap";
import { TiTimes, TiTrash } from "react-icons/ti";
import SimplePopupWithActions from "./SimplePopupWithActions";
import AnnotationTerms from "./AnnotationTerms";
import TermDefinitionAnnotationView from "./TermDefinitionAnnotationView";
import { GoPencil } from "react-icons/go";
import { useI18n } from "../hook/useI18n";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { removeTermDefinitionSource } from "../../action/AsyncTermActions";
import AccessLevel, { hasAccess } from "../../model/acl/AccessLevel";
import { IfAuthorized } from "react-authorization";

interface TermDefinitionAnnotationProps {
  target: string;
  term?: Term | null;
  resource?: string;
  text: string;
  isOpen: boolean;
  accessLevel: AccessLevel;
  language?: string;

  onRemove: () => void;
  onSelectTerm: (term: Term | null) => void;
  onToggleDetailOpen: () => void;
  onClose: () => void;
}

interface ButtonHandlers {
  onEdit: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function createActionButtons(
  i18n: (msgId: string) => string,
  editing: boolean,
  handlers: ButtonHandlers,
  accessLevel: AccessLevel
) {
  const actions = [];
  if (!editing) {
    actions.push(
      <IfAuthorized
        key="annotation.definition.edit"
        isAuthorized={hasAccess(AccessLevel.WRITE, accessLevel)}
      >
        <Button
          className="m-annotation-definition-edit"
          color="primary"
          title={i18n("edit")}
          size="sm"
          onClick={handlers.onEdit}
        >
          <GoPencil />
        </Button>
      </IfAuthorized>
    );
  }
  actions.push(
    <IfAuthorized
      key="annotation.definition.remove"
      isAuthorized={hasAccess(AccessLevel.WRITE, accessLevel)}
    >
      <Button
        className="m-annotation-definition-remove"
        color="primary"
        title={i18n("remove")}
        size="sm"
        onClick={handlers.onRemove}
      >
        <TiTrash />
      </Button>
    </IfAuthorized>
  );
  actions.push(
    <Button
      key="annotation.definition.close"
      className="m-annotation-definition-close"
      color="primary"
      title={i18n("annotation.close")}
      size="sm"
      onClick={handlers.onClose}
    >
      <TiTimes />
    </Button>
  );
  return actions;
}

export const TermDefinitionAnnotation: React.FC<
  TermDefinitionAnnotationProps
> = (props) => {
  const { i18n } = useI18n();
  const term = props.term !== undefined ? props.term : null;
  const [editing, setEditing] = React.useState(term === null);
  React.useEffect(() => {
    if (term) {
      setEditing(false);
    }
  }, [term]);
  const dispatch: ThunkDispatch = useDispatch();
  const onRemove = () => {
    props.onRemove();
    if (term) {
      dispatch(removeTermDefinitionSource(term));
    }
  };
  const bodyContent = editing ? (
    <AnnotationTerms
      onChange={props.onSelectTerm}
      canCreateTerm={false}
      selectedTerm={term}
    />
  ) : (
    <TermDefinitionAnnotationView
      term={term}
      resource={props.resource}
      textContent={props.text}
      language={props.language}
    />
  );

  return (
    <SimplePopupWithActions
      isOpen={props.isOpen}
      target={props.target}
      toggle={props.onToggleDetailOpen}
      component={bodyContent}
      actions={createActionButtons(
        i18n,
        editing,
        {
          onClose: props.onClose,
          onEdit: () => setEditing(!editing),
          onRemove,
        },
        props.accessLevel
      )}
      title={i18n("annotation.definition.title")}
    />
  );
};

export default TermDefinitionAnnotation;

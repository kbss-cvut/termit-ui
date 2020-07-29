import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term from "../../model/Term";
import {Button} from "reactstrap";
import {TiTimes, TiTrash} from "react-icons/ti";
import {injectIntl} from "react-intl";
import SimplePopupWithActions from "./SimplePopupWithActions";
import AnnotationTerms from "./AnnotationTerms";
import TermDefinitionAnnotationView from "./TermDefinitionAnnotationView";
import {GoPencil} from "react-icons/go";

interface TermDefinitionAnnotationProps extends HasI18n {
    target: string;
    term?: Term | null;
    resource?: string;
    text: string;
    isOpen: boolean;

    onRemove: () => void;
    onSelectTerm: (term: Term | null) => void;
    onToggleDetailOpen: () => void;
    onClose: () => void;
}

function createActionButtons(props: TermDefinitionAnnotationProps, editing: boolean, onEdit: () => void) {
    const i18n = props.i18n;
    const actions = [];
    if (!editing) {
        actions.push(<Button key="annotation.definition.edit"
                             className="m-annotation-definition-edit"
                             color="primary"
                             title={i18n("edit")}
                             size="sm"
                             onClick={onEdit}><GoPencil/></Button>);
    }
    actions.push(<Button key="annotation.definition.remove"
                         className="m-annotation-definition-remove"
                         color="primary"
                         title={i18n("remove")}
                         size="sm"
                         onClick={props.onRemove}><TiTrash/></Button>);
    actions.push(<Button key="annotation.definition.close"
                         className="m-annotation-definition-close"
                         color="primary"
                         title={i18n("annotation.close")}
                         size="sm"
                         onClick={props.onClose}><TiTimes/></Button>);
    return actions;
}

export const TermDefinitionAnnotation: React.FC<TermDefinitionAnnotationProps> = props => {
    const term = props.term !== undefined ? props.term : null;
    const [editing, setEditing] = React.useState(term === null);
    const bodyContent = editing ? <AnnotationTerms onChange={props.onSelectTerm} canCreateTerm={false}
                                                   selectedTerm={term}/> :
        <TermDefinitionAnnotationView term={term} resource={props.resource} textContent={props.text}/>;

    return <SimplePopupWithActions isOpen={props.isOpen} target={props.target} toggle={props.onToggleDetailOpen}
                                   component={bodyContent}
                                   actions={createActionButtons(props, editing, () => setEditing(!editing))}
                                   title={props.i18n("annotation.definition.title")}/>;
};

export default injectIntl(withI18n(TermDefinitionAnnotation));

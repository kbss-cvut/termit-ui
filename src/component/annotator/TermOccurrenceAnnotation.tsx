import * as React from "react";
import {injectIntl} from "react-intl";
import Term from "../../model/Term";
import withI18n, {HasI18n} from "../hoc/withI18n";
import AnnotationTerms from "./AnnotationTerms";
import {Button} from "reactstrap";
import {FaCheck} from "react-icons/fa";
import {TiTimes, TiTrash} from "react-icons/ti";
import {AnnotationOrigin} from "./Annotation";
import SimplePopupWithActions from "./SimplePopupWithActions";
import TermOccurrenceAnnotationView from "./TermOccurrenceAnnotationView";
import {GoPencil} from "react-icons/go";

interface TermOccurrenceAnnotationProps extends HasI18n {
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

function createActionButtons(props: TermOccurrenceAnnotationProps, editing: boolean, onEdit: () => void) {
    const i18n = props.i18n;
    const actions = [];
    const t = props.term ? props.term : null;
    if (props.annotationOrigin === AnnotationOrigin.PROPOSED && t !== null) {
        actions.push(<Button key="annotation.confirm"
                             color="primary"
                             title={i18n("annotation.confirm")}
                             size="sm"
                             onClick={() => props.onSelectTerm(t)}><FaCheck/></Button>);
    }
    if (!editing) {
        actions.push(<Button key="annotation.edit"
                             color="primary"
                             title={i18n("annotation.edit")}
                             size="sm"
                             onClick={onEdit}><GoPencil/></Button>);
    }
    actions.push(<Button key="annotation.remove"
                         color="primary"
                         title={i18n("annotation.remove")}
                         size="sm"
                         onClick={props.onRemove}><TiTrash/></Button>);
    actions.push(<Button key="annotation.close"
                         color="primary"
                         title={i18n("annotation.close")}
                         size="sm"
                         onClick={props.onClose}><TiTimes/></Button>);
    return actions;
}

export const TermOccurrenceAnnotation: React.FC<TermOccurrenceAnnotationProps> = props => {
    const term = props.term !== undefined ? props.term : null;
    const [editing, setEditing] = React.useState(term === null);
    const onConfirm = (t: Term) => {
        setEditing(false);
        props.onSelectTerm(t);
    };
    const onClose = () => {
        setEditing(false);
        props.onClose();
    };
    const popupBody = editing ? <AnnotationTerms selectedTerm={term}
                                                 onChange={props.onSelectTerm}
                                                 onCreateTerm={props.onCreateTerm}/> :
        <TermOccurrenceAnnotationView term={term} score={props.score} resource={props.resource}
                                      annotationClass={props.annotationClass}/>;

    return <SimplePopupWithActions isOpen={props.isOpen} target={props.target} toggle={props.onToggleDetailOpen}
                                   component={popupBody}
                                   actions={createActionButtons(Object.assign({}, props, {
                                       onSelectTerm: onConfirm,
                                       onClose
                                   }), editing, () => setEditing(!editing))}
                                   title={props.i18n("annotation.occurrence.title")}/>;
};

export default injectIntl(withI18n(TermOccurrenceAnnotation));

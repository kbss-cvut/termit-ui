import * as React from "react";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from "reactstrap";
import Vocabulary from "../../model/Vocabulary";
import TermItState from "../../model/TermItState";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadVocabularies} from "../../action/AsyncActions";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import Utils from "../../util/Utils";

interface PropsExt {
    vocabulary: Vocabulary | null;
    id?: string;
}

interface DispatchExt {
    onVocabularySet: (voc: Vocabulary) => void;
}

interface PropsCon {
    vocabularies: { [key: string]: Vocabulary },
}

interface DispatchCon {
    loadVocabularies: () => void
}

interface Props extends PropsExt, DispatchExt,
    PropsCon, HasI18n, DispatchCon {
}

export class VocabularySelect extends React.Component<Props> {

    public componentDidMount() {
        this.props.loadVocabularies();
    }

    private changeValue(vIri: string) {
        this.props.onVocabularySet(this.props.vocabularies[vIri]);
    }

    public render() {
        const that = this;
        const items = Object.keys(this.props.vocabularies || []).map(vIri => {
                const onClick = () => that.changeValue(vIri);
                return <DropdownItem className="m-vocabulary-select-item" key={vIri} onClick={onClick}>
                    {this.props.vocabularies[vIri].label}
                </DropdownItem>
            }
        );

        return <UncontrolledDropdown id={this.props.id} group={true} size="sm">
            <DropdownToggle caret={true}>
                {this.props.vocabulary ? this.props.vocabulary.label : that.props.i18n("vocabulary.select-vocabulary")}
            </DropdownToggle>
            <DropdownMenu modifiers={{
                setMaxHeight: {
                    enabled: true,
                    order: 890,
                    fn: (data) => {
                        return {
                            ...data,
                            styles: {
                                ...data.styles,
                                overflow: "auto",
                                maxHeight: Utils.calculateAssetListHeight() + "px",
                            },
                        };
                    },
                },
            }}>
                {items}
            </DropdownMenu>
        </UncontrolledDropdown>;
    }
}

export default connect<PropsCon, DispatchCon, PropsExt, TermItState>((state: TermItState) => {
    return {
        vocabularies: state.vocabularies
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadVocabularies: () => dispatch(loadVocabularies())
    };
})(injectIntl(withI18n(VocabularySelect)));

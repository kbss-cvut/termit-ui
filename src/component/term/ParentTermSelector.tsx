import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TermData} from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import {connect} from "react-redux";
import {ThunkDispatch, TreeSelectFetchOptionsParams} from "../../util/Types";
import {FormGroup, FormText, Label} from "reactstrap";
import Utils from "../../util/Utils";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import {createTermsWithImportsOptionRenderer} from "../misc/treeselect/Renderers";
import Vocabulary from "../../model/Vocabulary";
import TermItState from "../../model/TermItState";
import {commonTermTreeSelectProps, processTermsForTreeSelect} from "./TermTreeSelectHelper";
import {loadTermsFromWorkspace} from "../../action/AsyncTermActions";
import StorageUtils from "../../util/StorageUtils";
import Constants from "../../util/Constants";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import {loadTerms} from "../../action/AsyncActions";

function filterOutCurrentTerm(terms: Term[], currentTermIri?: string) {
    if (currentTermIri) {
        const result = [];
        for (const t of terms) {
            if (t.iri === currentTermIri) {
                continue;
            }
            if (t.plainSubTerms) {
                t.plainSubTerms = t.plainSubTerms.filter(st => st !== currentTermIri);
            }
            result.push(t);
        }
        return result;
    } else {
        return terms;
    }
}

interface ParentTermSelectorProps extends HasI18n {
    id: string;
    termIri?: string;
    parentTerms?: TermData[];
    vocabularyIri: string;
    currentVocabulary?: Vocabulary;
    onChange: (newParents: Term[]) => void;
    loadTermsFromWorkspace: (fetchOptions: FetchOptionsFunction) => Promise<Term[]>;
    loadTermsFromVocabulary: (fetchOptions: FetchOptionsFunction, vocabularyIri: IRI) => Promise<Term[]>;
}

interface ParentTermSelectorState {
    wholeWorkspace: boolean;
    disableConfig: boolean;
}

export class ParentTermSelector extends React.Component<ParentTermSelectorProps, ParentTermSelectorState> {

    private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

    constructor(props: ParentTermSelectorProps) {
        super(props);
        this.treeComponent = React.createRef();
        this.state = {
            wholeWorkspace: StorageUtils.is(Constants.STORAGE_PARENT_SELECTOR_WHOLE_WORKSPACE),
            disableConfig: false
        };
    }

    public componentWillUnmount() {
        StorageUtils.save(Constants.STORAGE_PARENT_SELECTOR_WHOLE_WORKSPACE, this.state.wholeWorkspace);
    }

    public onChange = (val: Term[] | Term | null) => {
        if (!val) {
            this.props.onChange([]);
        } else {
            this.props.onChange(Utils.sanitizeArray(val).filter(v => v.iri !== this.props.termIri));
        }
    };

    public fetchOptions = (fetchOptions: TreeSelectFetchOptionsParams<TermData>) => {
        this.setState({disableConfig: true});
        return this.state.wholeWorkspace ? this.fetchOptionsFromWorkspace(fetchOptions) : this.fetchOptionsFromVocabulary(fetchOptions);
    };

    private fetchOptionsFromVocabulary = (fetchOptions: TreeSelectFetchOptionsParams<TermData>) => {
        // Use option vocabulary when present, it may differ from the current vocabulary (when option is from imported
        // vocabulary)
        const parents = Utils.sanitizeArray(this.props.parentTerms).map(p => p.iri!);
        return this.props.loadTermsFromVocabulary({
            ...fetchOptions,
            includeTerms: parents
        }, VocabularyUtils.create(fetchOptions.option ? fetchOptions.option.vocabulary!.iri! : this.props.vocabularyIri)).then(terms => {
            this.setState({disableConfig: false});
            return filterOutCurrentTerm(processTermsForTreeSelect(terms, [this.props.vocabularyIri], {searchString: fetchOptions.searchString}), this.props.termIri);
        });
    };

    private fetchOptionsFromWorkspace = (fetchOptions: TreeSelectFetchOptionsParams<TermData>) => {
        return this.props.loadTermsFromWorkspace({
            ...fetchOptions
        }).then(terms => {
            this.setState({disableConfig: false});
            return filterOutCurrentTerm(processTermsForTreeSelect(terms, undefined, {searchString: fetchOptions.searchString}), this.props.termIri);
        });
    }

    private onWholeWorkspaceToggle = () => {
        this.setState({wholeWorkspace: !this.state.wholeWorkspace}, () => this.treeComponent.current.resetOptions());
    };

    private resolveSelectedParents() {
        const parents = Utils.sanitizeArray(this.props.parentTerms);
        return parents.filter(p => p.vocabulary !== undefined).map(p => p.iri);
    }

    public render() {
        return <FormGroup id={this.props.id}>
            <Label className="attribute-label">{this.props.i18n("term.metadata.parent")}</Label>
            <Label check={true} className="mr-1">{this.props.i18n("term.metadata.parent.useWorkspace")}</Label>
            <CustomCheckBoxInput checked={this.state.wholeWorkspace} disabled={this.state.disableConfig}
                                 onChange={this.onWholeWorkspaceToggle}/>
            {this.renderSelector()}
        </FormGroup>;
    }

    private renderSelector() {
        return <><IntelligentTreeSelect onChange={this.onChange}
                                        ref={this.treeComponent}
                                        value={this.resolveSelectedParents()}
                                        fetchOptions={this.fetchOptions}
                                        fetchLimit={300}
                                        maxHeight={200}
                                        multi={true}
                                        optionRenderer={createTermsWithImportsOptionRenderer(this.props.vocabularyIri)}
                                        {...commonTermTreeSelectProps(this.props)}/>
            <FormText>{this.props.i18n("term.parent.help")}</FormText>
        </>;
    }
}

export default connect((state: TermItState) => {
    return {
        currentVocabulary: state.vocabulary
    };
}, ((dispatch: ThunkDispatch) => {
    return {
        loadTermsFromWorkspace: (fetchOptions: FetchOptionsFunction) => dispatch(loadTermsFromWorkspace(fetchOptions)),
        loadTermsFromVocabulary: (fetchOptions: FetchOptionsFunction, vocabularyIri: IRI) => dispatch(loadTerms(fetchOptions, vocabularyIri))
    }
}))(injectIntl(withI18n(ParentTermSelector)));

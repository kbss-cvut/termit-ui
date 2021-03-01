import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TermData} from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import {connect} from "react-redux";
import {ThunkDispatch, TreeSelectFetchOptionsParams} from "../../util/Types";
import {Button, ButtonGroup, FormFeedback, FormGroup, FormText, Label} from "reactstrap";
import {loadTerms} from "../../action/AsyncActions";
import Utils from "../../util/Utils";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import {createTermsWithImportsOptionRenderer, createTermValueRenderer} from "../misc/treeselect/Renderers";
import {commonTermTreeSelectProps, processTermsForTreeSelect} from "./TermTreeSelectHelper";
import {loadTermsFromWorkspace, loadTermsIncludingCanonical} from "../../action/AsyncTermActions";
import StorageUtils from "../../util/StorageUtils";
import Constants from "../../util/Constants";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";

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
    invalid?: boolean;
    invalidMessage?: JSX.Element;
    vocabularyIri: string;
    onChange: (newParents: Term[]) => void;
    loadTermsFromVocabulary: (fetchOptions: FetchOptionsFunction, vocabularyIri: IRI) => Promise<Term[]>;
    loadTermsFromWorkspace: (fetchOptions: FetchOptionsFunction) => Promise<Term[]>;
    loadTermsIncludingCanonical: (fetchOptions: FetchOptionsFunction) => Promise<Term[]>;
}

interface ParentTermSelectorState {
    selectorRange: string;
    disableConfig: boolean;
}

export const ParentSelectorRange = {
    VOCABULARY: "VOCABULARY",
    WORKSPACE: "WORKSPACE",
    CANONICAL: "CANONICAL"
}

export class ParentTermSelector extends React.Component<ParentTermSelectorProps, ParentTermSelectorState> {

    private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

    constructor(props: ParentTermSelectorProps) {
        super(props);
        this.treeComponent = React.createRef();
        this.state = {
            selectorRange: StorageUtils.load(Constants.STORAGE_PARENT_SELECTOR_RANGE, ParentSelectorRange.VOCABULARY)!,
            disableConfig: false
        };
    }

    public componentWillUnmount() {
        StorageUtils.save(Constants.STORAGE_PARENT_SELECTOR_RANGE, this.state.selectorRange);
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
        switch (this.state.selectorRange) {
            case ParentSelectorRange.WORKSPACE:
                return this.fetchOptionsFromWorkspace(fetchOptions);
            case ParentSelectorRange.CANONICAL:
                return this.fetchOptionsIncludingCanonical(fetchOptions);
            default:
                return this.fetchOptionsFromVocabulary(fetchOptions);
        }
    };

    private fetchOptionsFromVocabulary = (fetchOptions: TreeSelectFetchOptionsParams<TermData>) => {
        // Use option vocabulary when present, it may differ from the current vocabulary (when option is from imported
        // vocabulary)
        const parents = Utils.sanitizeArray(this.props.parentTerms).map(p => p.iri!);
        const parentVocabs: string[] = Utils.sanitizeArray(this.props.parentTerms).filter(p => p.vocabulary).map(p => p.vocabulary!.iri!);
        return this.props.loadTermsFromVocabulary({
            ...fetchOptions,
            includeTerms: parents
        }, VocabularyUtils.create(fetchOptions.option ? fetchOptions.option.vocabulary!.iri! : this.props.vocabularyIri)).then(terms => {
            this.setState({disableConfig: false});
            return filterOutCurrentTerm(processTermsForTreeSelect(terms, [...parentVocabs, this.props.vocabularyIri], {searchString: fetchOptions.searchString}), this.props.termIri);
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

    private fetchOptionsIncludingCanonical = (fetchOptions: TreeSelectFetchOptionsParams<TermData>) => {
        return this.props.loadTermsIncludingCanonical({
            ...fetchOptions
        }).then(terms => {
            this.setState({disableConfig: false});
            return filterOutCurrentTerm(processTermsForTreeSelect(terms, undefined, {searchString: fetchOptions.searchString}), this.props.termIri);
        });
    }

    private onRangeToggle = (value: string) => {
        this.setState({selectorRange: value}, () => this.treeComponent.current.resetOptions());
    };

    private resolveSelectedParents() {
        const parents = Utils.sanitizeArray(this.props.parentTerms);
        return parents.filter(p => p.vocabulary !== undefined).map(p => p.iri);
    }

    public render() {
        const range = this.state.selectorRange;
        const i18n = this.props.i18n;
        return <FormGroup id={this.props.id}>
            <Label className="attribute-label">{i18n("term.metadata.parent")}</Label>
            <br/>
            <ButtonGroup className="mb-1">
                <Button key={ParentSelectorRange.VOCABULARY} color="primary" outline={true} size="sm"
                        onClick={() => this.onRangeToggle(ParentSelectorRange.VOCABULARY)}
                        active={range === ParentSelectorRange.VOCABULARY}
                        disabled={this.state.disableConfig}>{i18n("term.metadata.parent.range.vocabulary")}</Button>
                <Button key={ParentSelectorRange.WORKSPACE} color="primary" outline={true} size="sm"
                        onClick={() => this.onRangeToggle(ParentSelectorRange.WORKSPACE)}
                        active={range === ParentSelectorRange.WORKSPACE}
                        disabled={this.state.disableConfig}>{i18n("term.metadata.parent.range.workspace")}</Button>
                <Button key={ParentSelectorRange.CANONICAL} color="primary" outline={true} size="sm"
                        onClick={() => this.onRangeToggle(ParentSelectorRange.CANONICAL)}
                        active={range === ParentSelectorRange.CANONICAL}
                        disabled={this.state.disableConfig}>{i18n("term.metadata.parent.range.canonical")}</Button>
            </ButtonGroup>
            {this.renderSelector()}
        </FormGroup>;
    }

    private renderSelector() {
        let style;
        if (this.props.invalid) {
            style = {borderColor: "red"};
        } else {
            style = {}
        }
        return <><IntelligentTreeSelect onChange={this.onChange}
                                        ref={this.treeComponent}
                                        value={this.resolveSelectedParents()}
                                        fetchOptions={this.fetchOptions}
                                        fetchLimit={300}
                                        maxHeight={200}
                                        multi={true}
                                        optionRenderer={createTermsWithImportsOptionRenderer(this.props.vocabularyIri)}
                                        valueRenderer={createTermValueRenderer()}
                                        style={style}
                                        {...commonTermTreeSelectProps(this.props)}/>
            {this.props.invalid ?
                <FormFeedback style={{display: "block"}}>{this.props.invalidMessage}</FormFeedback> : <></>}
            <FormText>{this.props.i18n("term.parent.help")}</FormText>
        </>;
    }
}

export default connect(undefined, ((dispatch: ThunkDispatch) => {
    return {
        loadTermsFromVocabulary: (fetchOptions: FetchOptionsFunction, vocabularyIri: IRI) => dispatch(loadTerms(fetchOptions, vocabularyIri)),
        loadTermsFromWorkspace: (fetchOptions: FetchOptionsFunction) => dispatch(loadTermsFromWorkspace(fetchOptions)),
        loadTermsIncludingCanonical: (fetchOptions: FetchOptionsFunction) => dispatch(loadTermsIncludingCanonical(fetchOptions))
    }
}))(injectIntl(withI18n(ParentTermSelector)));

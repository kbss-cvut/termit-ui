import * as React from "react";
import FetchOptionsFunction from "../../model/Functions";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import Term, {TermData} from "../../model/Term";
import Workspace from "../../model/Workspace";
import {TreeSelectFetchOptionsParams} from "../../util/Types";
import {processTermsForTreeSelect} from "./TermTreeSelectHelper";

export interface BaseRelatedTermSelectorProps {
    vocabularyIri: string;
    workspace: Workspace;
    loadTermsFromVocabulary: (
        fetchOptions: FetchOptionsFunction,
        vocabularyIri: IRI
    ) => Promise<Term[]>;
    loadTermsFromCurrentWorkspace: (
        fetchOptions: FetchOptionsFunction,
        excludeVocabulary: string
    ) => Promise<Term[]>;
    loadTermsFromCanonical: (
        fetchOptions: FetchOptionsFunction
    ) => Promise<Term[]>;
}

export interface BaseRelatedTermSelectorState {
    allVocabularyTerms: boolean;
    allWorkspaceTerms: boolean;
    vocabularyTermCount: number;
    workspaceTermCount: number;
    lastSearchString: string;
}

export const PAGE_SIZE = 50;
export const SEARCH_DELAY = 300;

export default abstract class BaseRelatedTermSelector<P extends BaseRelatedTermSelectorProps = BaseRelatedTermSelectorProps, S extends BaseRelatedTermSelectorState = BaseRelatedTermSelectorState> extends React.Component<P, S> {

    public fetchOptions (
        fetchOptions: TreeSelectFetchOptionsParams<TermData>
    ){
        let {
            allVocabularyTerms,
            allWorkspaceTerms,
            vocabularyTermCount,
            workspaceTermCount,
            lastSearchString,
        } = this.state;
        let fetchFunction: (
            fetchOptions: TreeSelectFetchOptionsParams<TermData>
        ) => Promise<Term[]>;
        const offset = fetchOptions.offset || 0;
        const fetchOptionsCopy = Object.assign({}, fetchOptions);
        if (
            fetchOptions.searchString?.indexOf(lastSearchString) === -1 ||
            (lastSearchString.length === 0 &&
                (fetchOptions.searchString || "").length > 0)
        ) {
            this.setState({
                allVocabularyTerms: false,
                allWorkspaceTerms: false,
                vocabularyTermCount: 0,
                workspaceTermCount: 0,
            });
            // Set these to false to ensure the effect right now
            allVocabularyTerms = false;
            allWorkspaceTerms = false;
            fetchOptionsCopy.offset = 0;
        }
        if (allVocabularyTerms) {
            if (allWorkspaceTerms) {
                fetchOptionsCopy.offset =
                    offset - (vocabularyTermCount + workspaceTermCount);
                fetchFunction = this.fetchCanonicalTerms;
            } else {
                fetchOptionsCopy.offset = offset - vocabularyTermCount;
                fetchFunction = this.fetchWorkspaceTerms;
            }
        } else {
            fetchFunction = this.fetchVocabularyTerms;
        }
        this.setState({ lastSearchString: fetchOptions.searchString || "" });
        return fetchFunction(fetchOptionsCopy).then((terms) => {
            return processTermsForTreeSelect(terms, undefined, {
                    searchString: fetchOptionsCopy.searchString,
                });
        });
    };

    protected fetchVocabularyTerms = (
        fetchOptions: TreeSelectFetchOptionsParams<TermData>
    ) => {
        return this.props
            .loadTermsFromVocabulary(
                fetchOptions,
                VocabularyUtils.create(this.props.vocabularyIri)
            )
            .then((terms) => {
                this.setState({
                    allVocabularyTerms: terms.length < PAGE_SIZE,
                    vocabularyTermCount: this.state.vocabularyTermCount + terms.length,
                });
                if (terms.length < PAGE_SIZE) {
                    const fetchOptionsCopy = Object.assign({}, fetchOptions);
                    fetchOptionsCopy.offset = 0;
                    return this.fetchWorkspaceTerms(fetchOptionsCopy).then((wsTerms) =>
                        terms.concat(wsTerms)
                    );
                } else {
                    return Promise.resolve(terms);
                }
            });
    };

    protected fetchWorkspaceTerms = (
        fetchOptions: TreeSelectFetchOptionsParams<TermData>
    ) => {
        return this.props
            .loadTermsFromCurrentWorkspace(fetchOptions, this.props.vocabularyIri)
            .then((terms) => {
                this.setState({
                    allWorkspaceTerms: terms.length < PAGE_SIZE,
                    workspaceTermCount: this.state.workspaceTermCount + terms.length,
                });
                if (terms.length < PAGE_SIZE) {
                    const fetchOptionsCopy = Object.assign({}, fetchOptions);
                    fetchOptionsCopy.offset = 0;
                    return this.fetchCanonicalTerms(fetchOptionsCopy).then((wsTerms) =>
                        terms.concat(wsTerms)
                    );
                } else {
                    return Promise.resolve(terms);
                }
            });
    };

    protected fetchCanonicalTerms = (
        fetchOptions: TreeSelectFetchOptionsParams<TermData>
    ) => {
        return this.props.loadTermsFromCanonical(fetchOptions);
    };
}
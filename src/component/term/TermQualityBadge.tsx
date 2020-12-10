import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {RouteComponentProps, withRouter} from "react-router";
import {connect} from "react-redux";
import Term from "../../model/Term";
import TermItState from "../../model/TermItState";
import {Badge} from "reactstrap";
import Utils from "../../util/Utils";
import ValidationResult from "../../model/ValidationResult";
import Routing from "../../util/Routing";
import {ConsolidatedResults} from "../../model/ConsolidatedResults";

interface TermQualityBadgeProps extends HasI18n, RouteComponentProps<any> {
    term: Term | null;
    validationResults: ConsolidatedResults;
}

export const importantRules = [
    "https://slovník.gov.cz/jazyk/obecný/g4",
    "https://slovník.gov.cz/jazyk/obecný/m1",
    "https://slovník.gov.cz/jazyk/obecný/g13",
    "https://slovník.gov.cz/jazyk/obecný/g14"
];

export class TermQualityBadge extends React.Component<TermQualityBadgeProps> {

    private computeScore(results: ValidationResult[]): number | undefined {
        return results.reduce((reduceScore, result) => {
            if (importantRules.indexOf(result.sourceShape?.iri) >= 0) {
                return reduceScore - 25;
            }
            return reduceScore;
        }, 100);
    }

    public setBadgeColor(score: number | undefined): string {
        switch (score) {
            case 100:
                return "dark-green";
            case 75:
            case 50:
                return "dark-yellow";
            case 25:
            case 0:
                return "dark-red";
            default:
                return "gray";
        }
    }

    public onBadgeClick = () => {
        const namespace = Utils.extractQueryParam(this.props.location.search, "namespace");
        const query = new Map();
        if (namespace) {
            query.set("namespace", namespace);
        }
        query.set("activeTab", "term.metadata.validation.title");
        Routing.transitionToAsset(this.props.term!, {query})
    }

    public render() {
        let score: number | undefined;
        if (this.props.validationResults) {
            score = this.computeScore(this.props.validationResults[this.props.term!.iri] || []);
        }
        return <Badge color={this.setBadgeColor(score)}
                      className="term-quality-badge"
                      title={(score !== undefined) ? this.props.formatMessage("term.badge.score.tooltip", {score}) : this.props.i18n("term.badge.no-score.tooltip")}
                      onClick={this.onBadgeClick}
        >&nbsp;
        </Badge>;
    }
}

export default connect((state: TermItState) => {
    return {
        validationResults: state.validationResults[state.vocabulary.iri]
    };
})(injectIntl(withI18n(withRouter(TermQualityBadge))));

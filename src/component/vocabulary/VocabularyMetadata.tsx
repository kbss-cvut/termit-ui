import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
import {Card, CardBody, Col, Label, Row} from "reactstrap";
import UnmappedProperties from "../genericmetadata/UnmappedProperties";
import ImportedVocabulariesList from "./ImportedVocabulariesList";
import Tabs from "../misc/Tabs";
import AssetHistory from "../changetracking/AssetHistory";
import TermChangeFrequency from "./TermChangeFrequency";
import Terms from "../term/Terms";
import {Location} from "history";
import {match as Match} from "react-router";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {selectVocabularyTerm} from "../../action/SyncActions";
import Utils from "../../util/Utils";
import OptionalDocumentSummaryInTab from "../resource/document/OptionalDocumentSummaryInTab";

interface VocabularyMetadataProps extends HasI18n {
    vocabulary: Vocabulary;
    onChange: () => void;
    resetSelectedTerm: () => void;
    location: Location;
    match: Match<any>;
}

interface VocabularyMetadataState {
    activeTab: string;
}

export class VocabularyMetadata extends React.Component<VocabularyMetadataProps, VocabularyMetadataState> {
    constructor(props: VocabularyMetadataProps) {
        super(props);
        this.state = {
            activeTab: (Utils.extractQueryParam(this.props.location.search, "activeTab") === "vocabulary.validation.tab") ? "vocabulary.validation.tab" : "glossary.title"
        };
    }

    public componentDidMount() {
        this.props.resetSelectedTerm();
    }

    private onTabSelect = (tabId: string) => {
        this.setState({activeTab: tabId});
    };

    public render() {
        const i18n = this.props.i18n;
        const vocabulary = this.props.vocabulary;

        return <>
            <Card className="mb-3">
                <CardBody className="card-body-basic-info">
                    <Row>
                        <Col xl={2} md={4}>
                            <Label className="attribute-label mb-3">{i18n("vocabulary.comment")}</Label>
                        </Col>
                        <Col xl={10} md={8}>
                            <p id="vocabulary-metadata-comment">{vocabulary.comment}</p>
                        </Col>
                    </Row>
                    <ImportedVocabulariesList vocabularies={vocabulary.importedVocabularies}/>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            {this.renderTabs()}
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>;
    }

    private renderTabs() {
        const vocabulary = this.props.vocabulary;
        const tabs = {};
        // Ensure order of tabs Terms | (Files) | Unmapped properties | History

        tabs["glossary.title"] =
            <Terms vocabulary={this.props.vocabulary} match={this.props.match} location={this.props.location}
                   showTermQualityBadge={true}/>

        tabs["vocabulary.detail.document"] =
            <OptionalDocumentSummaryInTab vocabulary={vocabulary} onChange={this.props.onChange}/>;
        tabs["history.label"] = <AssetHistory asset={vocabulary}/>;

        tabs["changefrequency.label"] = <TermChangeFrequency vocabulary={vocabulary}/>;

        tabs["properties.edit.title"] = <UnmappedProperties properties={vocabulary.unmappedProperties}
                                                            showInfoOnEmpty={true}/>;

        return <Tabs activeTabLabelKey={this.state.activeTab} changeTab={this.onTabSelect} tabs={tabs} tabBadges={{
            "properties.edit.title": vocabulary.unmappedProperties.size.toFixed(),
            "vocabulary.detail.document": vocabulary.document ? "1" : "0",
        }}/>;
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        resetSelectedTerm: () => dispatch(selectVocabularyTerm(null))
    };
})(injectIntl(withI18n(VocabularyMetadata)));

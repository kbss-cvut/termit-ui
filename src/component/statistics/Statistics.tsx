import * as React from "react";
import AssetCount from "./assetcount/AssetCount";
import Vocabulary from "../../util/VocabularyUtils";
import {default as withI18n, HasI18n} from "../hoc/withI18n";
import templateAssetCount from "./assetcount/AssetCount.rq";
import termCount from "./assetcount/TermCount.rq";
import templateTermTypeFrequency from "./termtypefrequency/TermTypeFrequency.rq";
import {injectIntl} from "react-intl";
import TermTypeFrequency from "./termtypefrequency/TermTypeFrequency";
import FullscreenablePanelWithActions from "../misc/FullscreenablePanelWithActions";
import PanelWithActions from "../misc/PanelWithActions";
import {Col, Row} from "reactstrap";
import HeaderWithActions from "../misc/HeaderWithActions";

const Statistics = (props: HasI18n) => {

    const query = (iri: string) => templateAssetCount.split("?assetType").join("<" + iri + ">");

    return <div>
        <HeaderWithActions title={props.i18n("main.nav.statistics")} />
        <Row>
            <Col lg={4} xs={12}>
                <PanelWithActions title={props.i18n("statistics.vocabulary.count")}>
                    <AssetCount sparqlQuery={query(Vocabulary.VOCABULARY)}/>
                </PanelWithActions>
            </Col>
            <Col lg={4} xs={12}>
                <PanelWithActions
                    title={props.i18n("statistics.term.count")}>
                    <AssetCount sparqlQuery={termCount}/>
                </PanelWithActions>
            </Col>
            <Col lg={4} xs={12}>
                <PanelWithActions
                    title={props.i18n("statistics.user.count")}>
                    <AssetCount sparqlQuery={query(Vocabulary.USER)}/>
                </PanelWithActions>
            </Col>
        </Row>
        <Row>
            <Col>
                <FullscreenablePanelWithActions actions={[]}
                                                title={props.i18n("statistics.term.count")}>
                    <TermTypeFrequency sparqlQuery={templateTermTypeFrequency}
                                       empty={props.i18n("statistics.types.frequency.empty")}
                                       notFilled={props.i18n("statistics.notFilled")}
                                       lang={props.locale}/>
                </FullscreenablePanelWithActions>
            </Col>
        </Row>
    </div>;
};

export default injectIntl(withI18n(Statistics));
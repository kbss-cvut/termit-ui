import * as React from "react";
import AssetCount from "./assetcount/AssetCount";
import Vocabulary from "../../util/VocabularyUtils";
import {default as withI18n, HasI18n} from "../hoc/withI18n";
import raw from "raw.macro";
import {injectIntl} from "react-intl";
import TermTypeFrequency from "./termtypefrequency/TermTypeFrequency";
import FullscreenablePanelWithActions from "../misc/FullscreenablePanelWithActions";
import PanelWithActions from "../misc/PanelWithActions";
import {Col, Row} from "reactstrap";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";

const Statistics = (props: HasI18n) => {

    const templateAssetCount = React.useMemo(() => raw("./assetcount/AssetCount.rq"), []);
    const query = (iri: string) => templateAssetCount.split("?assetType").join("<" + iri + ">");

    return <div>
        <WindowTitle title={props.i18n("main.nav.statistics")}/>
        <HeaderWithActions title={props.i18n("main.nav.statistics")}/>
        <Row>
            <Col lg={4} xs={12}>
                <PanelWithActions title={props.i18n("statistics.vocabulary.count")}>
                    <AssetCount sparqlQuery={query(Vocabulary.VOCABULARY)}/>
                </PanelWithActions>
            </Col>
            <Col lg={4} xs={12}>
                <PanelWithActions
                    title={props.i18n("statistics.term.count")}>
                    <AssetCount sparqlQuery={raw("./assetcount/TermCount.rq")}/>
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
                    <TermTypeFrequency sparqlQuery={raw("./termtypefrequency/TermTypeFrequency.rq")}
                                       empty={props.i18n("statistics.types.frequency.empty")}
                                       notFilled={props.i18n("statistics.notFilled")}
                                       lang={props.locale}/>
                </FullscreenablePanelWithActions>
            </Col>
        </Row>
    </div>;
};

export default injectIntl(withI18n(Statistics));

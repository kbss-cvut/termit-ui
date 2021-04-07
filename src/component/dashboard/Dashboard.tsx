import * as React from "react";
import {Col, Row} from "reactstrap";
import TermFrequency from "../statistics/termfrequency/TermFrequency";
import PanelWithActions from "../misc/PanelWithActions";
import LastEditedAssets from "./widget/lastedited/LastEditedAssets";
import "./Dashboard.scss";
import NewsAlert from "./widget/NewsAlert";
import Constants from "../../util/Constants";
import WindowTitle from "../misc/WindowTitle";
import {useI18n} from "../hook/useI18n";
import LastCommentedAssets from "./widget/lastcommented/LastCommentedAssets";
import raw from "raw.macro";

const Dashboard: React.FC = () => {
    const {i18n, locale} = useI18n();
    return <>
        <WindowTitle title={Constants.APP_NAME} appendAppName={false}/>
        <NewsAlert/>
        <Row>
            <Col xl={4} lg={6} md={12}>
                <LastEditedAssets/>
            </Col>
            <Col xl={4} lg={6} md={12}>
                <LastCommentedAssets/>
            </Col>
            <Col xl={4} lg={6} md={12}>
                <PanelWithActions className="p-0" title={i18n("dashboard.widget.typeFrequency.title")}>
                    <TermFrequency sparqlQuery={raw("../statistics/termfrequency/TermFrequency.rq")} lang={locale}/>
                </PanelWithActions>
            </Col>
        </Row>
    </>;
}

export default Dashboard;

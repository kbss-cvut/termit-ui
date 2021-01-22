import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Col, Row} from "reactstrap";
import TermFrequency from "../statistics/termfrequency/TermFrequency";
import PanelWithActions from "../misc/PanelWithActions";
import templateQuery from "../statistics/termfrequency/TermFrequency.rq";
import LastEditedAssets from "./widget/LastEditedAssets";
import "./Dashboard.scss";
import NewsAlert from "./widget/NewsAlert";
import MyAssets from "./widget/MyAssets";
import Constants from "../../util/Constants";
import WindowTitle from "../misc/WindowTitle";

const Dashboard: React.FC<HasI18n> = props => <>
    <WindowTitle title={Constants.APP_NAME} appendAppName={false}/>
    <NewsAlert/>
    <Row>
        <Col xl={4} lg={6} md={12}>
            <LastEditedAssets/>
        </Col>
        <Col xl={4} lg={6} md={12}>
            <MyAssets/>
        </Col>
        <Col xl={4} lg={6} md={12}>
            <PanelWithActions className="p-0" title={props.i18n("dashboard.widget.typeFrequency.title")}>
                <TermFrequency
                    sparqlQuery={templateQuery}
                    lang={props.locale}/>
            </PanelWithActions>
        </Col>
    </Row>
</>;

export default injectIntl(withI18n(Dashboard));

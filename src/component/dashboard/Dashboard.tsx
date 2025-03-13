import * as React from "react";
import { Col, Row } from "reactstrap";
import LastEditedAssets from "./widget/lastedited/LastEditedAssets";
import NewsAlert from "./widget/NewsAlert";
import Constants from "../../util/Constants";
import WindowTitle from "../misc/WindowTitle";
import LastCommentedAssets from "./widget/lastcommented/LastCommentedAssets";
import TermDistributionWidget from "./widget/TermDistributionWidget";
import "./Dashboard.scss";

const Dashboard: React.FC = () => {
  return (
    <>
      <WindowTitle title={Constants.APP_NAME} appendAppName={false} />
      <NewsAlert />
      <Row className="mb-3">
        <Col xl={4} lg={6} md={12}>
          <LastEditedAssets />
        </Col>
        <Col xl={4} lg={6} md={12}>
          <LastCommentedAssets />
        </Col>
        <Col xl={4} lg={6} md={12}>
          <TermDistributionWidget />
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;

import * as React from "react";
import AssetCount from "./assetcount/AssetCount";
import raw from "raw.macro";
import TermTypeFrequency from "./termtypefrequency/TermTypeFrequency";
import PanelWithActions from "../misc/PanelWithActions";
import { Col, Row } from "reactstrap";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import { useI18n } from "../hook/useI18n";

const Statistics: React.FC = () => {
  const { i18n, locale } = useI18n();

  return (
    <div>
      <WindowTitle title={i18n("main.nav.statistics")} />
      <HeaderWithActions title={i18n("main.nav.statistics")} />
      <Row>
        <Col lg={4} xs={12}>
          <PanelWithActions title={i18n("statistics.vocabulary.count")}>
            <AssetCount assetType="VOCABULARY" />
          </PanelWithActions>
        </Col>
        <Col lg={4} xs={12}>
          <PanelWithActions title={i18n("statistics.term.count")}>
            <AssetCount assetType="TERM" />
          </PanelWithActions>
        </Col>
        <Col lg={4} xs={12}>
          <PanelWithActions title={i18n("statistics.user.count")}>
            <AssetCount assetType="USER" />
          </PanelWithActions>
        </Col>
      </Row>
      <Row>
        <Col>
          <PanelWithActions title={i18n("statistics.term.count")}>
            <TermTypeFrequency
              sparqlQuery={raw("./termtypefrequency/TermTypeFrequency.rq")}
              empty={i18n("statistics.types.frequency.empty")}
              notFilled={i18n("statistics.notFilled")}
              lang={locale}
            />
          </PanelWithActions>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;

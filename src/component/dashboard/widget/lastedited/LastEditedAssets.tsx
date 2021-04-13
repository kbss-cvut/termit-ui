import * as React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import Tabs from "../../../misc/Tabs";
import withI18n from "../../../hoc/withI18n";
import { injectIntl } from "react-intl";
import { useI18n } from "../../../hook/useI18n";
import AllLastEditedAssets from "./AllLastEditedAssets";
import MyLastEditedAssets from "./MyLastEditedAssets";

export const LastEditedAssets = () => {
  const { i18n } = useI18n();
  const [activeTab, setActiveTab] = React.useState(
    "dashboard.widget.lastEditedAssets.all.title"
  );

  const toggle = (tab: string) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  return (
    <Card>
      <CardHeader tag="h4" color="primary">
        {i18n("dashboard.widget.lastEditedAssets.title")}
      </CardHeader>
      <CardBody className="py-0">
        <Tabs
          navLinkStyle="small"
          activeTabLabelKey={activeTab}
          changeTab={toggle}
          tabs={{
            "dashboard.widget.lastEditedAssets.all.title": (
              <AllLastEditedAssets />
            ),
            "dashboard.widget.lastEditedAssets.mine.title": (
              <MyLastEditedAssets />
            ),
          }}
        />
      </CardBody>
    </Card>
  );
};

export default injectIntl(withI18n(LastEditedAssets));

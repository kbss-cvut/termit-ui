import * as React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import MyLastCommentedAssets from "./MyLastCommentedAssets";
import LastCommentedAssetsInReactionToMine from "./LastCommentedAssetsInReactionToMine";
import Tabs from "../../../misc/Tabs";
import AllLastCommentedAssets from "./AllLastCommentedAssets";
import { useI18n } from "../../../hook/useI18n";
import IfUserIsEditor from "../../../authorization/IfUserIsEditor";

const LastCommentedAssets = () => {
  const { i18n } = useI18n();
  const [activeTab, setActiveTab] = React.useState(
    "dashboard.widget.lastCommentedAssets.all.title"
  );

  const toggle = (tab: string) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  return (
    <Card className="h-100">
      <CardHeader tag="h4" color="primary">
        {i18n("dashboard.widget.lastCommentedAssets.title")}
      </CardHeader>
      <CardBody className="py-0">
        <IfUserIsEditor
          renderUnauthorizedAlert={true}
          unauthorized={
            <Tabs
              navLinkStyle="small"
              activeTabLabelKey={activeTab}
              changeTab={toggle}
              tabs={{
                "dashboard.widget.lastCommentedAssets.all.title": (
                  <AllLastCommentedAssets />
                ),
                "dashboard.widget.lastCommentedAssets.inReactionToMine.title": (
                  <LastCommentedAssetsInReactionToMine />
                ),
              }}
            />
          }
        >
          <Tabs
            navLinkStyle="small"
            activeTabLabelKey={activeTab}
            changeTab={toggle}
            tabs={{
              "dashboard.widget.lastCommentedAssets.all.title": (
                <AllLastCommentedAssets />
              ),
              "dashboard.widget.lastCommentedAssets.mine.title": (
                <MyLastCommentedAssets />
              ),
              "dashboard.widget.lastCommentedAssets.inReactionToMine.title": (
                <LastCommentedAssetsInReactionToMine />
              ),
            }}
          />
        </IfUserIsEditor>
      </CardBody>
    </Card>
  );
};

export default LastCommentedAssets;

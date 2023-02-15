import * as React from "react";
import Users from "./user/Users";
import Maintenance from "./Maintenance";
import WindowTitle from "../misc/WindowTitle";
import { useI18n } from "../hook/useI18n";
import Tabs from "../misc/Tabs";

const Administration: React.FC = () => {
  const { i18n } = useI18n();
  const [activeTab, setActiveTab] = React.useState("administration.users");
  return (
    <>
      <WindowTitle title={i18n("main.nav.admin")} />
      <Tabs
        activeTabLabelKey={activeTab}
        tabs={{
          "administration.users": <Users />,
          "administration.maintenance.title": <Maintenance />,
        }}
        changeTab={setActiveTab}
      />
    </>
  );
};

export default Administration;

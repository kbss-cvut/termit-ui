import * as React from "react";
import Users from "./user/Users";
import Maintenance from "./Maintenance";
import WindowTitle from "../misc/WindowTitle";
import { useI18n } from "../hook/useI18n";
import Tabs from "../misc/Tabs";
import UserGroups from "./group/UserGroups";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadUsers } from "../../action/AsyncUserActions";
import { useLocation } from "react-router-dom";
import Utils from "../../util/Utils";
import { trackPromise } from "react-promise-tracker";

const Administration: React.FC = () => {
  const { i18n } = useI18n();
  const [activeTab, setActiveTab] = React.useState("administration.users");
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    trackPromise(dispatch(loadUsers()), "users");
  }, [dispatch]);
  const location = useLocation();
  React.useEffect(() => {
    const activeTabFromUrl = Utils.extractQueryParam(
      location.search,
      "activeTab"
    );
    if (activeTabFromUrl) {
      setActiveTab(activeTabFromUrl);
    }
  }, [location.search]);
  return (
    <>
      <WindowTitle title={i18n("main.nav.admin")} />
      <Tabs
        activeTabLabelKey={activeTab}
        tabs={{
          "administration.users": <Users />,
          "administration.groups": <UserGroups />,
          "administration.maintenance.title": <Maintenance />,
        }}
        changeTab={setActiveTab}
      />
    </>
  );
};

export default Administration;

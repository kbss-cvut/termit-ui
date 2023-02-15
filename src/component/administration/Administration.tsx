import * as React from "react";
import Users from "./user/Users";
import Maintenance from "./Maintenance";
import WindowTitle from "../misc/WindowTitle";
import { useI18n } from "../hook/useI18n";

const Administration: React.FC = () => {
  const { i18n } = useI18n();
  return (
    <>
      <WindowTitle title={i18n("main.nav.admin")} />
      <Users />
      <Maintenance />
    </>
  );
};

export default Administration;

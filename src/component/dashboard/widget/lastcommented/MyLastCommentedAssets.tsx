import React from "react";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";
import { loadMyLastCommented } from "../../../../action/AsyncDashboardActions";

const MyLastCommentedAssets: React.FC = () => (
  <CommonLastCommentedAssets loadAssets={loadMyLastCommented} />
);

export default MyLastCommentedAssets;

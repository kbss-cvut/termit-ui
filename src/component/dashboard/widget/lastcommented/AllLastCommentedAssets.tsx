import React from "react";
import { loadLastCommentedAssets } from "../../../../action/AsyncDashboardActions";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";

const AllLastCommentedAssets: React.FC = () => (
  <CommonLastCommentedAssets loadAssets={loadLastCommentedAssets} />
);

export default AllLastCommentedAssets;

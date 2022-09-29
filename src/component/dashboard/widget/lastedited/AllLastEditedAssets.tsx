import React from "react";
import { loadLastEditedAssets } from "../../../../action/AsyncDashboardActions";
import CommonLastEditedAssets from "./CommonLastEditedAssets";

export const AllLastEditedAssets: React.FC = () => (
  <CommonLastEditedAssets loadAssets={loadLastEditedAssets} />
);

export default AllLastEditedAssets;

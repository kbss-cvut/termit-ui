import React from "react";
import { loadMyAssets } from "../../../../action/AsyncDashboardActions";
import CommonLastEditedAssets from "./CommonLastEditedAssets";

export const MyLastEditedAssets: React.FC = () => (
  <CommonLastEditedAssets loadAssets={loadMyAssets} />
);

export default MyLastEditedAssets;

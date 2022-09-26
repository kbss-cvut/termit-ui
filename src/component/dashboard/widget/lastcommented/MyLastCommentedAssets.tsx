import React from "react";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";
import { loadMyLastCommented } from "../../../../action/AsyncCommentedAssetActions";

const MyLastCommentedAssets: React.FC = () => (
  <CommonLastCommentedAssets loadAssets={loadMyLastCommented} />
);

export default MyLastCommentedAssets;

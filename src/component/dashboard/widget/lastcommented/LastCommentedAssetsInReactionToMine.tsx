import React from "react";
import { loadLastCommentedInReactionToMine } from "../../../../action/AsyncCommentedAssetActions";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";

const LastCommentedAssetsInReactionToMine: React.FC = () => (
  <CommonLastCommentedAssets loadAssets={loadLastCommentedInReactionToMine} />
);

export default LastCommentedAssetsInReactionToMine;

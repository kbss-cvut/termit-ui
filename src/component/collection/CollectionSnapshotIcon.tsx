import { FunctionComponent } from "react";
import {
  SkosCollectionDto,
  SkosCollectionDtoData,
} from "../../model/Collection";
import Vocabulary from "../../model/Vocabulary";
import Routing from "../../util/Routing";
import { Link } from "react-router-dom";
import SnapshotIcon from "../snapshot/SnapshotIcon";
import Routes from "../../util/Routes";

export interface CollectionIconProps {
  collection: SkosCollectionDto | null;
  vocabulary: Vocabulary | null;
}

export const CollectionSnapshotIcon: FunctionComponent<CollectionIconProps> = ({
  collection,
  vocabulary,
}) => {
  if (!collection?.snapshotOf() || !vocabulary?.snapshotOf()) {
    return null;
  }

  const originalCollection: SkosCollectionDtoData = {
    ...collection,
    iri: collection.snapshotOf()!,
    vocabulary: { iri: vocabulary.snapshotOf()! },
  };

  const routingParams = Routing.makeCollectionDetailParams(originalCollection);

  return (
    <>
      <Link
        to={Routing.getTransitionPath(
          Routes.vocabularyCollectionDetail,
          routingParams
        )}
      >
        <SnapshotIcon
          messageKey={"collection.snapshot.message"}
          assetType=""
          id="collection-snapshot-icon"
        />
      </Link>
    </>
  );
};

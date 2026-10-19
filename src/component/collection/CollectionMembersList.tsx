import { SkosCollectionDto } from "../../model/Collection";
import { FunctionComponent, useState } from "react";
import { TermInfo } from "../../model/Term";

export interface CollectionMembersListProps {
  collection: SkosCollectionDto | null;
  shortLocale: string;
}

export const CollectionMembersList: FunctionComponent<
  CollectionMembersListProps
> = ({ shortLocale }: CollectionMembersListProps) => {
  const [members, setMembers] = useState<Array<SkosCollectionDto | TermInfo>>(
    []
  );

  return null;
};

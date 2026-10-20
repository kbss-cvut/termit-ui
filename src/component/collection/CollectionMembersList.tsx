import { SkosCollectionDto } from "../../model/Collection";
import { FunctionComponent, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

export interface CollectionMembersListProps {
  collection: SkosCollectionDto | null;
  shortLocale: string;
}

const DRAG_ICON_SIZE = "24px";

export const DragReorderIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={DRAG_ICON_SIZE}
    height={DRAG_ICON_SIZE}
    fill="none"
    stroke="grey"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 5l3-3 3 3" /> {/* arrow up */}
    <path d="M5 10h14" />
    <path d="M5 14h14" />
    <path d="M9 19l3 3 3-3" /> {/* arrow down */}
  </svg>
);

export const CollectionMembersList: FunctionComponent<
  CollectionMembersListProps
> = ({ shortLocale }: CollectionMembersListProps) => {
  const columns = useMemo<ColumnDef<SkosCollectionDto>[]>(
    () => [
      {
        id: "drag",
        cell: DragReorderIcon,
        enableSorting: false,
      },
      {
        id: "label",
        accessorFn: (dto) => dto.getLabel(shortLocale),
        enableSorting: false,
      },
    ],
    [shortLocale]
  );

  return null;
};

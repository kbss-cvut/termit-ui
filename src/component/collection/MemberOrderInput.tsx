import {
  FunctionComponent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Input } from "reactstrap";
import { CollectionMember } from "../../model/Collection";
import { Row } from "@tanstack/react-table";

export type IndexChangeCallback = (
  row: Row<CollectionMember>,
  newIndex: number
) => void;

/**
 * Displays position of the row and allows moving the row by changing it
 */
export const MemberOrderInput: FunctionComponent<{
  row: Row<CollectionMember>;
  onIndexChange: IndexChangeCallback;
}> = ({ row, onIndexChange }) => {
  const [order, setOrder] = useState(String(row.index + 1));
  // the row may be moved by another row's change
  useEffect(() => setOrder(String(row.index + 1)), [row.index]);

  const commit = useCallback(() => {
    const newIndex = Number.parseInt(order) - 1;
    if (Number.isNaN(newIndex) || newIndex === row.index) {
      setOrder(String(row.index + 1));
      return;
    }
    onIndexChange(row, newIndex);
  }, [onIndexChange, order, row]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setOrder(String(row.index + 1));
      }
    },
    [commit, row.index]
  );

  return (
    <Input
      className={"order"}
      type={"text"}
      inputMode={"numeric"}
      value={order}
      onChange={(e) => setOrder(e.currentTarget.value.replace(/\D/g, ""))}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
};

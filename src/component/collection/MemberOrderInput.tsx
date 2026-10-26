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
  const originalRowOrder = String(row.index + 1);

  const [order, setOrder] = useState(originalRowOrder);
  // the row may be moved by another row's change
  useEffect(() => setOrder(originalRowOrder), [originalRowOrder]);

  const commit = useCallback(() => {
    // in result the row may not be moved, reset its position
    // and wait for update of the row index
    setOrder(originalRowOrder);

    const newIndex = Number.parseInt(order) - 1;
    if (!Number.isFinite(newIndex) || newIndex === row.index) {
      return;
    }
    onIndexChange(row, newIndex);
  }, [onIndexChange, order, originalRowOrder, row]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setOrder(originalRowOrder);
      }
    },
    [commit, originalRowOrder]
  );

  return (
    <Input
      className={"order"}
      type={"text"}
      inputMode={"numeric"}
      value={order}
      onChange={(e) => {
        const newValue = Number(e.currentTarget.value.replace(/\D/g, ""));
        if (isFinite(newValue) && newValue > 0) {
          setOrder(newValue.toString());
        } else {
          setOrder(originalRowOrder);
        }
      }}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
};

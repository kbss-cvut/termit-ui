import {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Row, Table } from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";

// distance in pixels the pointer has to travel before the drag starts, so a click on the handle is not a drag
const DRAG_THRESHOLD = 4;
// distance in pixels from the edge of the scroll container where auto-scrolling starts
const AUTO_SCROLL_EDGE = 40;
// auto-scroll speed in pixels per frame when the pointer reaches the edge
const AUTO_SCROLL_MAX_SPEED = 15;
const BODY_DRAGGING_CLASS = "table-row-dragging";

export type RowMoveCallback<T> = (row: Row<T>, newIndex: number) => void;

interface DragState {
  rowId: string;
  // index of the gap between rows where the row would be dropped (0 is before the first row),
  // null when the drop would not move the row
  dropIndex: number | null;
}

/**
 * Returns the number of pixels the container should be scrolled by, based on how close the pointer is to its edge
 */
function autoScrollSpeed(clientY: number, rect: DOMRect): number {
  const edge = Math.min(AUTO_SCROLL_EDGE, rect.height / 4);
  let ratio = 0;
  if (clientY < rect.top + edge) {
    ratio = -(rect.top + edge - clientY) / edge;
  } else if (clientY > rect.bottom - edge) {
    ratio = (clientY - rect.bottom + edge) / edge;
  }
  // the pointer may be outside the container
  ratio = Math.max(-1, Math.min(1, ratio));
  // browsers may ignore sub-pixel scrolling
  return Math.sign(ratio) * Math.ceil(Math.abs(ratio) * AUTO_SCROLL_MAX_SPEED);
}

/**
 * Allows reordering rows of a virtualized table by dragging them with a pointer.
 *
 * The drop target is resolved from the virtualizer measurements, so the drag survives the dragged row
 * being unmounted when the table is scrolled.
 * Only the loaded rows can be targeted, the table auto-scrolls (and thus loads more rows)
 * when the pointer gets close to its edge.
 *
 * @param tableRef table with the rows
 * @param rowVirtualizerRef virtualizer of the table rows
 * @param onRowMove called when the row is dropped at a new position
 * @returns startDrag to be called on pointer down on the drag handle of the row
 * and getRowClassName providing classes of the dragged row and the drop indicator
 */
export function useRowDragReorder<T>(
  tableRef: MutableRefObject<Table<T> | null>,
  rowVirtualizerRef: MutableRefObject<Virtualizer<
    HTMLDivElement,
    HTMLTableRowElement
  > | null>,
  onRowMove: RowMoveCallback<T>
) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  // releases listeners of the drag in progress
  const stopDragRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopDragRef.current?.(), []);

  const startDrag = useCallback(
    (row: Row<T>, event: ReactPointerEvent<Element>) => {
      if (!event.isPrimary || event.button !== 0 || stopDragRef.current) {
        return;
      }
      const tbody = event.currentTarget.closest("tbody");
      if (!tbody) {
        return;
      }
      // prevents text selection and native dragging
      event.preventDefault();

      const { pointerId } = event;
      const rowId = row.id;
      const fromIndex = row.index;
      const startY = event.clientY;
      let clientY = startY;
      let active = false;
      let dropIndex: number | null = null;
      let frame = 0;

      const tick = () => {
        const virtualizer = rowVirtualizerRef.current;
        const scrollElement = virtualizer?.scrollElement;
        if (!virtualizer || !scrollElement || !tbody.isConnected) {
          end(false);
          return;
        }
        scrollElement.scrollTop += autoScrollSpeed(
          clientY,
          scrollElement.getBoundingClientRect()
        );
        // rows move under the pointer when the table scrolls, so the target is resolved in every frame
        const offset = clientY - tbody.getBoundingClientRect().top;
        const item = virtualizer.getVirtualItemForOffset(offset);
        let target: number | null = null;
        if (item) {
          target =
            offset > item.start + item.size / 2 ? item.index + 1 : item.index;
        }
        // dropping right before or after the dragged row would not move it
        if (target === fromIndex || target === fromIndex + 1) {
          target = null;
        }
        if (target !== dropIndex) {
          dropIndex = target;
          setDragState({ rowId, dropIndex });
        }
        frame = requestAnimationFrame(tick);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) {
          return;
        }
        clientY = e.clientY;
        if (!active && Math.abs(clientY - startY) >= DRAG_THRESHOLD) {
          active = true;
          document.body.classList.add(BODY_DRAGGING_CLASS);
          setDragState({ rowId, dropIndex: null });
          frame = requestAnimationFrame(tick);
        }
      };
      const onPointerUp = (e: PointerEvent) => {
        if (e.pointerId === pointerId) {
          end(true);
        }
      };
      const onPointerCancel = (e: PointerEvent) => {
        if (e.pointerId === pointerId) {
          end(false);
        }
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          end(false);
        }
      };

      const stop = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerCancel);
        window.removeEventListener("keydown", onKeyDown);
        document.body.classList.remove(BODY_DRAGGING_CLASS);
        stopDragRef.current = null;
      };

      const end = (drop: boolean) => {
        stop();
        setDragState(null);
        if (!drop || !active || dropIndex === null) {
          return;
        }
        // the row is resolved again as the data may have changed during the drag
        const current = tableRef.current?.getRowModel().rowsById[rowId];
        if (!current) {
          return;
        }
        const newIndex = dropIndex > current.index ? dropIndex - 1 : dropIndex;
        if (newIndex !== current.index) {
          onRowMove(current, newIndex);
        }
      };

      // listening on window, as the handle is unmounted when its row is scrolled out of view
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
      window.addEventListener("keydown", onKeyDown);
      stopDragRef.current = stop;
    },
    [onRowMove, rowVirtualizerRef, tableRef]
  );

  const getRowClassName = useCallback(
    (row: Row<T>) =>
      dragState
        ? classNames({
            "row-dragged": row.id === dragState.rowId,
            // the drop indicator is drawn below the row preceding the gap, except for the first gap
            "row-drop-before": dragState.dropIndex === 0 && row.index === 0,
            "row-drop-after":
              dragState.dropIndex !== null &&
              row.index === dragState.dropIndex - 1,
          })
        : undefined,
    [dragState]
  );

  return { startDrag, getRowClassName };
}

import { FunctionComponent, PointerEvent } from "react";
import "./DragHandle.scss";

export const DragHandle: FunctionComponent<{
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
}> = ({ onPointerDown }) => (
  <div className={"drag-handle"} onPointerDown={onPointerDown}>
    <DragReorderIcon />
  </div>
);

export const DragReorderIcon: FunctionComponent<{ size?: string }> = ({
  size = "24px",
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="grey"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5l3-3 3 3" /> {/* arrow up */}
    <path d="M5 10h14" />
    <path d="M5 14h14" />
    <path d="M9 19l3 3 3-3" /> {/* arrow down */}
  </svg>
);

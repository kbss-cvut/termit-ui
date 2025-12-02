import React from "react";
import { Button } from "reactstrap";

export interface FacetToggleProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

/**
 * Simple toggle button to show/hide a facet.
 */
const FacetToggle: React.FC<FacetToggleProps> = ({
  active,
  label,
  onClick,
}) => (
  <Button
    size="sm"
    color={active ? "primary" : "secondary"}
    outline={!active}
    className="mr-2 mb-2"
    onClick={onClick}
    aria-pressed={active}
  >
    {label}
  </Button>
);

export default FacetToggle;

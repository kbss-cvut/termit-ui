import * as React from "react";
import { useState } from "react";
import { Button, Collapse } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

/**
 * "Show Advanced" component.
 *
 * It wraps components that are shown in advanced regime only.
 */
export const ShowAdvancedAssetFields: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const { i18n } = useI18n();
  const Icon = isOpen ? FaChevronUp : FaChevronDown;

  return (
    <>
      <Button
        id="toggle-advanced"
        onClick={toggle}
        className="mb-3"
        active={isOpen}
        size="sm"
      >
        <Icon className="mr-1 mb-1" />
        {i18n(
          isOpen
            ? "asset.create.hideAdvancedSection"
            : "asset.create.showAdvancedSection"
        )}
      </Button>
      <Collapse isOpen={isOpen}>{children}</Collapse>
    </>
  );
};

export default ShowAdvancedAssetFields;

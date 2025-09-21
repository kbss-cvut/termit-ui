import React from "react";
import { FaChevronLeft, FaChevronRight, FaSearchengin } from "react-icons/fa";
import {
  Button,
  ButtonToolbar,
  FormGroup,
  Label,
  Popover,
  PopoverBody,
  PopoverHeader,
} from "reactstrap";
import { useI18n } from "../hook/useI18n";
import Term from "../../model/Term";
import AnnotatorTermsSelector from "./AnnotatorTermsSelector";
import { getLocalized } from "../../model/MultilingualString";
import { getTermOccurrences } from "./HtmlDomUtils";

interface HighlightTermOccurrencesButtonProps {
  term: Term | null;
  highlightIndex: number;
  onChange: (t: Term | null) => void;
  onHighlightIndexChange: (change: number) => void;
}

const HighlightTermOccurrencesButton: React.FC<
  HighlightTermOccurrencesButtonProps
> = ({ term, highlightIndex, onChange, onHighlightIndexChange }) => {
  const { i18n, formatMessage, locale } = useI18n();
  const [showPopup, setShowPopup] = React.useState(false);
  const onSelect = (t: Term | null) => {
    onChange(t);
  };
  const count = term !== null ? getTermOccurrences(term.iri!).length : -1;

  return (
    <>
      <Popover
        target="annotator-highlight-occurrences-selector"
        placement="left"
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        fade={false}
        className="annotator-highlight-occurrences-popup"
      >
        <PopoverHeader>
          {i18n("annotator.highlight.selector.title")}
          <button className="close" onClick={() => setShowPopup(false)}>
            ×
          </button>
        </PopoverHeader>
        <PopoverBody>
          <FormGroup className="mb-2">
            <div className="align-items-center d-flex mb-2">
              <div className="flex-grow-1">
                <Label className="attribute-label mb-0">
                  {i18n("annotator.highlight.selector.label")}
                </Label>
              </div>
            </div>
            <AnnotatorTermsSelector
              onChange={onSelect}
              term={term}
              autoFocus={true}
            />
          </FormGroup>
          {term !== null && (
            <>
              <ButtonToolbar className="w-100 justify-content-between mb-2 align-middle">
                <Button
                  size="sm"
                  onClick={() => onHighlightIndexChange(-1)}
                  disabled={highlightIndex < 0}
                >
                  <FaChevronLeft />
                </Button>
                <div className="align-content-center">
                  {highlightIndex + 1} / {count}
                </div>
                <Button
                  size="sm"
                  onClick={() => onHighlightIndexChange(1)}
                  disabled={highlightIndex >= count - 1}
                >
                  <FaChevronRight />
                </Button>
              </ButtonToolbar>
            </>
          )}
        </PopoverBody>
      </Popover>
      <Button
        id="annotator-highlight-occurrences-selector"
        key="annotator-highlight-occurrences-selector"
        color="primary"
        size="sm"
        onClick={() => setShowPopup(!showPopup)}
        className="annotator-action-button"
        active={term !== null}
        title={
          term != null
            ? formatMessage("annotator.highlight.button.active.tooltip", {
                term: getLocalized(term.label, locale),
              })
            : i18n("annotator.highlight.button.inactive.tooltip")
        }
      >
        <FaSearchengin className="mr-1" />
        {i18n("annotator.highlight.button.label")}
      </Button>
    </>
  );
};

export default HighlightTermOccurrencesButton;

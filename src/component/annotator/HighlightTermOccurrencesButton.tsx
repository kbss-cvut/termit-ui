import React from "react";
import { FaSearchengin } from "react-icons/fa";
import {
  Button,
  FormGroup,
  Label,
  Popover,
  PopoverBody,
  PopoverHeader,
} from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { TermData } from "../../model/Term";
import AnnotatorTermsSelector from "./AnnotatorTermsSelector";
import { getLocalized } from "../../model/MultilingualString";
import TermOccurrenceCountInfo from "./TermOccurrenceCountInfo";

interface HighlightTermOccurrencesButtonProps {
  term: TermData | null;
  onChange: (t: TermData | null) => void;
}

const HighlightTermOccurrencesButton: React.FC<HighlightTermOccurrencesButtonProps> =
  ({ term, onChange }) => {
    const { i18n, formatMessage, locale } = useI18n();
    const [showPopup, setShowPopup] = React.useState(false);
    const onSelect = (t: TermData | null) => {
      // setShowPopup(false);
      onChange(t);
    };

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
              <TermOccurrenceCountInfo term={term} />
            </FormGroup>
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

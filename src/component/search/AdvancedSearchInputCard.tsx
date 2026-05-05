import React from "react";
import {
  Button,
  ButtonGroup,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from "reactstrap";
import { FaTimes } from "react-icons/fa";
import { useI18n } from "../hook/useI18n";
import LanguageSelector from "../resource/file/LanguageSelector";
import type { Language } from "../../util/IntlUtil";
import { SearchTarget } from "../../model/search/SearchTarget";

interface AdvancedSearchInputCardProps {
  searchString: string;
  selectedLanguage: string;
  searchTarget: SearchTarget;
  advancedOpen: boolean;
  canShowAdvanced: boolean;
  indexedLanguages: Language[];
  onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onLanguageChange: (langCode: string) => void;
  onTargetChange: (target: SearchTarget) => void;
  resetSearch: () => void;
  toggleAdvanced: () => void;
}

const AdvancedSearchInputCard: React.FC<AdvancedSearchInputCardProps> = ({
  searchString,
  selectedLanguage,
  searchTarget,
  advancedOpen,
  canShowAdvanced,
  indexedLanguages,
  onSearchInputChange,
  onSearchKeyPress,
  onLanguageChange,
  onTargetChange,
  resetSearch,
  toggleAdvanced,
}) => {
  const { i18n } = useI18n();

  return (
    <>
      {/* Search target toggle */}
      <Row className="mb-3">
        <Col
          xs={12}
          className="d-flex justify-content-center align-items-center"
        >
          <ButtonGroup size="sm">
            <Button
              color={
                searchTarget === SearchTarget.BOTH ? "primary" : "secondary"
              }
              outline={searchTarget !== SearchTarget.BOTH}
              onClick={() => onTargetChange(SearchTarget.BOTH)}
              id="search-target-both"
              size="sm"
            >
              {i18n("search.target.both")}
            </Button>
            <Button
              color={
                searchTarget === SearchTarget.TERMS ? "primary" : "secondary"
              }
              outline={searchTarget !== SearchTarget.TERMS}
              onClick={() => onTargetChange(SearchTarget.TERMS)}
              id="search-target-terms"
              size="sm"
            >
              {i18n("search.target.terms")}
            </Button>
            <Button
              color={
                searchTarget === SearchTarget.VOCABULARIES
                  ? "primary"
                  : "secondary"
              }
              outline={searchTarget !== SearchTarget.VOCABULARIES}
              onClick={() => onTargetChange(SearchTarget.VOCABULARIES)}
              id="search-target-vocabularies"
              size="sm"
            >
              {i18n("search.target.vocabularies")}
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Search input bar */}
      <Row className="mb-2">
        <Col xs={12}>
          <InputGroup className="input-group-rounded input-group-merge">
            <InputGroupAddon
              addonType="prepend"
              className="search-icon"
              title={i18n("main.search.tooltip")}
            >
              <InputGroupText>
                <span className="fas fa-search" />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="unified-search-input"
              aria-label="Search"
              className="form-control-rounded form-control-prepended"
              placeholder={i18n("main.search.placeholder")}
              type="search"
              autoComplete="off"
              value={searchString}
              onChange={onSearchInputChange}
              onKeyPress={onSearchKeyPress}
            />
            {indexedLanguages.length > 1 && (
              <InputGroupAddon addonType="append">
                <LanguageSelector
                  className="unified-search-language-select"
                  onChange={onLanguageChange}
                  value={selectedLanguage}
                  isClearable={true}
                  languageOptions={indexedLanguages}
                />
              </InputGroupAddon>
            )}
            {searchString && (
              <InputGroupAddon
                addonType="append"
                id="search-reset"
                onClick={resetSearch}
              >
                <Button
                  title={i18n("search.reset")}
                  color="outline-dark"
                  style={{ zIndex: 5 }}
                >
                  <FaTimes style={{ marginBottom: 4 }} />
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>
        </Col>
      </Row>

      {/* Advanced toggle */}
      {canShowAdvanced && (
        <Row>
          <Col xs={12} className="text-right">
            <Button
              color="link"
              size="sm"
              onClick={toggleAdvanced}
              id="toggle-advanced-search"
            >
              {advancedOpen
                ? i18n("search.advanced.hide")
                : i18n("search.advanced.show")}
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
};

export default AdvancedSearchInputCard;

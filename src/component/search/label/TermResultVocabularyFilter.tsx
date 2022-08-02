import React, { useEffect, useState } from "react";
import SearchResult from "../../../model/SearchResult";
import Utils from "../../../util/Utils";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { useI18n } from "../../hook/useI18n";
import { Col, Row } from "reactstrap";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { getLabel } from "../../../action/AsyncActions";

interface TermResultVocabularyFilterProps {
  searchResults: SearchResult[];
  selectedVocabularies: string[];
  onChange: (selectedVocabularies: string[]) => void;
}

interface Option {
  label: string;
  value: string;
}

function resolveUniqueVocabularies(searchResults: SearchResult[]) {
  return [
    ...new Set(
      searchResults
        .filter((sr) => sr.vocabulary !== undefined)
        .map((sr) => sr.vocabulary!.iri)
    ),
  ];
}

const TermResultVocabularyFilter: React.FC<TermResultVocabularyFilterProps> = ({
  searchResults,
  selectedVocabularies,
  onChange,
}) => {
  const dispatch: ThunkDispatch = useDispatch();
  const { i18n } = useI18n();
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    const unique = resolveUniqueVocabularies(
      Utils.sanitizeArray(searchResults)
    );
    Promise.all(
      unique.map((iri) =>
        dispatch(getLabel(iri)).then((label) => ({
          value: iri,
          label,
        }))
      )
    ).then((res) => {
      res.sort((a, b) => a.label.localeCompare(b.label));
      setOptions(res);
    });
  }, [searchResults, dispatch, setOptions]);
  const onSelect = (selection: Option[] | null) => {
    onChange(Utils.sanitizeArray(selection).map((s) => s.value));
  };

  return (
    <Row className="mb-3">
      <Col>
        <IntelligentTreeSelect
          value={selectedVocabularies}
          onChange={onSelect}
          valueKey="value"
          labelKey="label"
          classNamePrefix="react-select"
          maxHeight={150}
          multi={true}
          renderAsTree={false}
          simpleTreeData={true}
          options={options}
          placeholder={i18n("search.tab.terms.filter.allVocabularies")}
          showSettings={false}
          noResultsText={i18n("main.search.no-results")}
        />
      </Col>
    </Row>
  );
};

export default TermResultVocabularyFilter;

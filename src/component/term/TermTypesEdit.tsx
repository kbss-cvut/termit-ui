import * as React from "react";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import "intelligent-tree-select/lib/styles.css";
import Term, { TermData } from "../../model/Term";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { FormFeedback, FormGroup, Label } from "reactstrap";
import VocabularyUtils from "../../util/VocabularyUtils";
import { ThunkDispatch } from "../../util/Types";
import { loadTypes } from "../../action/AsyncActions";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import HelpIcon from "../misc/HelpIcon";
import { mapTypeOptions } from "../misc/treeselect/OptionMappers";
import { useI18n } from "../hook/useI18n";

interface TermTypesEditProps {
  termTypes: string[];
  onChange: (types: string[]) => void;
  validationMessage?: string | React.JSX.Element;
}

function resolveSelectedTypes(
  selected: string[],
  options: Term[]
): string | undefined {
  const matching = options.filter(
    (t) => t.iri !== VocabularyUtils.TERM && selected.indexOf(t.iri) !== -1
  );
  return matching.length > 0 ? matching[0].iri : undefined;
}

const TermTypesEdit: React.FC<TermTypesEditProps> = ({
  termTypes,
  onChange,
  validationMessage,
}) => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadTypes());
  }, [dispatch]);
  const onSelect = (val: Term | null) => {
    onChange(val ? [val.iri, VocabularyUtils.TERM] : [VocabularyUtils.TERM]);
  };
  const types = useSelector((state: TermItState) => state.types);
  const typeOptions = React.useMemo(() => mapTypeOptions(types), [types]);

  return (
    <FormGroup>
      <Label className="attribute-label">
        {i18n("term.metadata.types")}
        <HelpIcon id={"test-types-edit"} text={i18n("term.types.help")} />
      </Label>
      <IntelligentTreeSelect
        onChange={onSelect}
        value={resolveSelectedTypes(termTypes, typeOptions)}
        options={typeOptions}
        valueKey="iri"
        getOptionLabel={(option: TermData) =>
          getLocalized(option.label, getShortLocale(locale))
        }
        childrenKey="subTerms"
        maxHeight={150}
        multi={false}
        expanded={true}
        renderAsTree={true}
        placeholder=""
        classNamePrefix="react-select"
      />
      {validationMessage && (
        <FormFeedback
          className="validation-feedback"
          title={i18n("validation.message.tooltip")}
        >
          {validationMessage}
        </FormFeedback>
      )}
    </FormGroup>
  );
};

export default TermTypesEdit;

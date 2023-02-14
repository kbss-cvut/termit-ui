import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadTypes } from "../../action/AsyncActions";
import TermItState from "../../model/TermItState";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";
import { OWL, SKOS } from "../../util/Namespaces";
// @ts-ignore
import { List } from "reactstrap";
import Term from "../../model/Term";
import OutgoingLink from "../misc/OutgoingLink";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import { useI18n } from "../hook/useI18n";

function filterTypes(types?: string[]) {
  return Utils.sanitizeArray(types).filter(
    (t) =>
      t !== VocabularyUtils.TERM &&
      !t.startsWith(SKOS.namespace) &&
      !t.startsWith(OWL.namespace)
  );
}

const TermTypes: React.FC<{ types?: string[] }> = ({ types }) => {
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadTypes());
  }, [dispatch]);
  const { locale } = useI18n();
  const typeOptions = useSelector((state: TermItState) => state.types);
  const typesToRender = filterTypes(types)
    .sort()
    .map((t) => typeOptions[t])
    .filter((t) => t !== undefined);
  if (typesToRender.length === 0) {
    return null;
  }

  return (
    <List type="unstyled" id="term-metadata-types" className="mb-3">
      {typesToRender.map((item: Term) => (
        <li key={item.iri}>
          <OutgoingLink
            iri={item.iri}
            label={getLocalized(item.label, getShortLocale(locale))}
          />
        </li>
      ))}
    </List>
  );
};

export default TermTypes;

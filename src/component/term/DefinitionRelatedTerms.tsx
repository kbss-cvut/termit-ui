import React from "react";
import Term, { TermInfo } from "../../model/Term";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { loadTermByIri } from "../../action/AsyncActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import { ThunkDispatch } from "../../util/Types";
import { Badge } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import TermLink from "./TermLink";
import VocabularyNameBadgeButton from "../vocabulary/VocabularyNameBadgeButton";

interface DefinitionRelatedTermsProps {
  term: Term;
  relatedTerms: TermInfo[];
  language: string;
}

const DefinitionRelatedTerms: React.FC<DefinitionRelatedTermsProps> = (
  props
) => {
  const { relatedTerms, term, language } = props;
  const [termCache, setTermCache] = React.useState<{
    [iri: string]: Term | TermInfo;
  }>(() => {
    const tc: { [iri: string]: Term | TermInfo } = {};
    relatedTerms.forEach((t) => (tc[t.iri] = t));
    return tc;
  });
  const defRelateTerms = useSelector(
    (state: TermItState) => state.definitionallyRelatedTerms
  );
  const distinctRelatedIris = new Set<string>();
  defRelateTerms.targeting
    .filter((to) => !to.isSuggested())
    .forEach((to) => distinctRelatedIris.add(to.term.iri!));
  const toDisplay = Array.from(distinctRelatedIris);
  toDisplay.sort();
  const dispatch = useDispatch<ThunkDispatch>();
  React.useEffect(() => {
    const irisToLoad = new Set<string>();
    defRelateTerms.targeting.forEach((to) => irisToLoad.add(to.term.iri!));
    Promise.all(
      Array.from(irisToLoad)
        .filter((iri) => termCache[iri] === undefined)
        .map((iri) => dispatch(loadTermByIri(VocabularyUtils.create(iri))))
    ).then((res) => {
      if (res.length === 0) {
        return;
      }
      const change = {};
      res
        .filter((r) => r !== null)
        .forEach((r) => {
          change[r!.iri] = r;
        });
      setTermCache(Object.assign({}, termCache, change));
    });
  }, [dispatch, termCache, setTermCache, defRelateTerms]);

  return (
    <>
      {toDisplay
        .filter((iri) => termCache[iri] !== undefined)
        .map((iri) => (
          <li key={`${iri}-definitional`}>
            <DefinitionBadge />
            <TermLink term={termCache[iri]} language={language} />
            {term.vocabulary?.iri !== termCache[iri].vocabulary?.iri && (
              <VocabularyNameBadgeButton
                vocabulary={termCache[iri].vocabulary}
                termIri={iri}
                section={"definition-related-terms-"}
              />
            )}
          </li>
        ))}
    </>
  );
};

export const DefinitionBadge: React.FC = () => {
  const { i18n } = useI18n();
  return (
    <Badge
      className="mr-1 align-text-bottom"
      color="secondary"
      title={i18n("term.metadata.related.definitionally.tooltip")}
    >
      {i18n("term.metadata.definition")}
    </Badge>
  );
};

export default DefinitionRelatedTerms;

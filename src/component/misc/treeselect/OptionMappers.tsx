import Term from "../../../model/Term";

/**
 * Maps types to tree select options.
 * @param types types to map
 */
export function mapTypeOptions(types: { [key: string]: Term }) {
  if (!types) {
    return [];
  }
  const typesMap = {};
  // Make a deep copy of the available types since we're going to modify them for the tree select
  Object.keys(types).forEach((t) => (typesMap[t] = new Term(types[t])));
  const options = Object.keys(typesMap).map((k) => typesMap[k]);
  options.forEach((t) => {
    if (t.subTerms) {
      // The tree-select needs parent for proper function
      // @ts-ignore
      t.subTerms.forEach((st) => (typesMap[st].parent = t.iri));
    }
  });
  return options;
}

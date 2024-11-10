import VocabularyUtils from "../../util/VocabularyUtils";

export interface VocabularyContentChangeFilterData {
  author: string;
  term: string;
  type: string;
  attribute: string;
}

export function getChangeTypeUri(
  filterData: VocabularyContentChangeFilterData
): string {
  switch (filterData.type) {
    case "history.type.persist":
      return VocabularyUtils.PERSIST_EVENT;
    case "history.type.update":
      return VocabularyUtils.UPDATE_EVENT;
    case "history.type.delete":
      return VocabularyUtils.DELETE_EVENT;
  }
  return "";
}

import VocabularyUtils from "../util/VocabularyUtils";

export const CONTEXT = {
  iri: "@id",
  created: {
    "@id": VocabularyUtils.CREATED,
    "@type": VocabularyUtils.XSD_DATETIME,
  },
  expirationDate: {
    "@id": VocabularyUtils.NS_TERMIT + "má-datum-expirace",
    "@type": VocabularyUtils.XSD_DATE,
  },
  lastUsed: {
    "@id": VocabularyUtils.NS_SIOC + "last_activity_date",
    "@type": VocabularyUtils.XSD_DATETIME,
  },
};

export interface PersonalAccessToken {
  iri: string;
  created: string;
  expirationDate: string;
  lastUsed: string;
}

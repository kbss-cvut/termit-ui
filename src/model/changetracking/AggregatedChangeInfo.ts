import VocabularyUtils from "../../util/VocabularyUtils";

export const CONTEXT = {
  date: {
    "@id": `${VocabularyUtils.PREFIX}m\u00e1-datum-a-\u010das-modifikace`,
    "@type": VocabularyUtils.XSD_DATE,
  },
  count: {
    "@id": `${VocabularyUtils.NS_ACTIVITY_STREAMS}totalItems`,
    "@type": VocabularyUtils.XSD_INT,
  },
  types: "@type",
};

export interface AggregatedChangeInfoData {
  count: number;
  date: string;
  types: string[];
}

export default class AggregatedChangeInfo implements AggregatedChangeInfoData {
  public readonly count: number;
  public readonly date: string;
  public readonly types: string[];

  public constructor(data: AggregatedChangeInfoData) {
    this.count = data.count;
    this.date = data.date;
    this.types = data.types;
  }

  public getDate() {
    return Date.parse(this.date);
  }
}

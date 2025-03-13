import { CONTEXT as RESOURCE_CONTEXT, RdfsResourceData } from "../RdfsResource";
import VocabularyUtils from "../../util/VocabularyUtils";

const ctx = {
  resource: VocabularyUtils.DC_SUBJECT,
  count: {
    "@id": VocabularyUtils.NS_ACTIVITY_STREAMS + "totalItems",
    "@type": VocabularyUtils.XSD_INT,
  },
};

export const CONTEXT = Object.assign({}, ctx, RESOURCE_CONTEXT);

export type DistributionDto = {
  resource: RdfsResourceData;
  count: number;
};

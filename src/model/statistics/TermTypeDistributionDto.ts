import { RdfsResourceData } from "../RdfsResource";
import {
  CONTEXT as DISTRIBUTION_CONTEXT,
  DistributionDto,
} from "./DistributionDto";
import VocabularyUtils from "../../util/VocabularyUtils";

const ctx = {
  typeDistribution: {
    "@id": VocabularyUtils.NS_TERMIT + "has-type-distribution",
    "@container": "@list",
  },
};

export const CONTEXT = Object.assign({}, ctx, DISTRIBUTION_CONTEXT);

export type TermTypeDistributionDto = {
  resource: RdfsResourceData;
  typeDistribution: DistributionDto[];
};

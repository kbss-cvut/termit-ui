import Ajax, { params } from "../../util/Ajax";
import Constants from "../../util/Constants";
import last from "last";

/**
 * Calls backend to generate a new identifier for an asset specified by the parameters.
 * @param parameters Identifier generation parameters
 */
let loadIdentifier = <T extends { name: string; assetType: string }>(
  parameters: T
) => {
  return Ajax.post(`${Constants.API_PREFIX}/identifiers`, params(parameters));
};

// This will cause the existing still running identifier requests to be ignored in favor of the most recent call
loadIdentifier = last(loadIdentifier);

export { loadIdentifier };

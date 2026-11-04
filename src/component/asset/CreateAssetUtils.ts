import Ajax, { params } from "../../util/Ajax";
import Constants from "../../util/Constants";
import last from "last";

/**
 * Calls backend to generate a new identifier for an asset specified by the parameters.
 * @param parameters Identifier generation parameters
 */
let loadIdentifier = async <T extends { name: string; assetType: string }>(
  parameters: T
): Promise<string> => {
  const resp = await Ajax.post(
    `${Constants.API_PREFIX}/identifiers`,
    params(parameters)
  );
  return resp.data;
};

// This will cause the existing still running identifier requests to be ignored in favor of the most recent call
loadIdentifier = last(loadIdentifier);

let generateNamespace = async (vocabularyIri: string): Promise<string> => {
  const resp = await Ajax.post(
    `${Constants.API_PREFIX}/identifiers/namespace`,
    params({ vocabularyIri })
  );
  return resp.data;
};

generateNamespace = last(generateNamespace);

export { loadIdentifier, generateNamespace };

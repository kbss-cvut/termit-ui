import Asset from "../../model/Asset";

/**
 * Verifies that the actual assets are correspond to the expected JSON-LD data.
 * @param expectedJsonLd Expected data in JSON-LD
 * @param actual Actual data
 */
export function verifyExpectedAssets(expectedJsonLd: object[], actual: Asset[]) {
    expect(actual.length).toEqual(expectedJsonLd.length);
    expectedJsonLd.sort((a: object, b: object) => a["@id"].localeCompare(b["@id"]));
    actual.sort((a, b) => a.iri.localeCompare(b.iri));
    for (let i = 0; i < expectedJsonLd.length; i++) {
        expect(actual[i].iri).toEqual(expectedJsonLd[i]["@id"]);
    }
}

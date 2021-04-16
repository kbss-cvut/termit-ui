import Asset from "../../model/Asset";
import { createMemoryHistory, Location } from "history";
import { match as MatchType, RouteComponentProps } from "react-router";

/**
 * Verifies that the actual assets are correspond to the expected JSON-LD data.
 * @param expectedJsonLd Expected data in JSON-LD
 * @param actual Actual data
 */
export function verifyExpectedAssets(
    expectedJsonLd: object[],
    actual: Asset[]
) {
    expect(actual.length).toEqual(expectedJsonLd.length);
    expectedJsonLd.sort((a: object, b: object) =>
        a["@id"].localeCompare(b["@id"])
    );
    actual.sort((a, b) => a.iri.localeCompare(b.iri));
    for (let i = 0; i < expectedJsonLd.length; i++) {
        expect(actual[i].iri).toEqual(expectedJsonLd[i]["@id"]);
    }
}

/**
 * Generates location object for tests.
 */
export function location(): Location {
    return {
        pathname: "/",
        search: "",
        hash: "",
        state: {},
    };
}

/**
 * Generates a match object for tests.
 */
export function match(): MatchType<any> {
    return {
        params: {},
        path: "/",
        isExact: true,
        url: "http://localhost:3000/",
    };
}

/**
 * Generates props for components wrapped in withRouter
 */
export function routingProps(): RouteComponentProps<any> {
    return {
        location: location(),
        match: match(),
        history: createMemoryHistory(),
    };
}

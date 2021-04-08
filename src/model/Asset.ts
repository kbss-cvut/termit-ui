export interface HasTypes {
    types?: string[] | string;
}

export interface HasLabel {
    getLabel: () => string;
}

export interface AssetData extends HasTypes {
    iri?: string;
}

/**
 * JSON-LD context definition for asset data.
 */
export const ASSET_CONTEXT = {
    iri: "@id",
    types: "@type"
};

export interface SupportsJsonLd<T extends any> {
    toJsonLd(): T;
}

export default abstract class Asset implements AssetData, HasLabel {
    public iri: string;
    public types?: string[];

    protected constructor(data: AssetData) {
        this.iri = data.iri || "";
    }

    public addType(type: string) {
        if (!this.types) {
            this.types = [];
        }
        if (this.types.indexOf(type) === -1) {
            this.types.push(type);
        }
    }

    public hasType(type: string): boolean {
        return this.types !== undefined && this.types.indexOf(type) !== -1;
    }

    public abstract getLabel(lang?: string): string;

    public abstract toJsonLd(): {};

    public static equals(a?: Asset | null, b?: Asset | null) {
        if (!a && !b) {
            return true;
        }
        if ((a && !b) || (!a && b)) {
            return false;
        }
        return a!.iri === b!.iri;
    }
}

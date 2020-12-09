import Asset, {AssetData} from "../model/Asset";
import Vocabulary, {VocabularyData} from "../model/Vocabulary";
import Resource, {ResourceData} from "../model/Resource";
import Document, {DocumentData} from "../model/Document";
import File, {FileData} from "../model/File";
import Term, {TermData} from "../model/Term";
import Utils from "./Utils";
import VocabularyUtils from "./VocabularyUtils";
import TermAssignment, {TermAssignmentData} from "../model/TermAssignment";
import TermOccurrence, {TermOccurrenceData} from "../model/TermOccurrence";
import ChangeRecord, {ChangeRecordData} from "../model/changetracking/ChangeRecord";
import PersistRecord from "../model/changetracking/PersistRecord";
import {UpdateRecord, UpdateRecordData} from "../model/changetracking/UpdateRecord";
import {langString} from "../model/MultilingualString";


const AssetFactory = {
    /**
     * Creates an instance of the appropriate asset class based on the specified data.
     *
     * @param data Data for asset instantiation
     */
    createAsset(data: AssetData): Asset {
        switch (Utils.getPrimaryAssetType(data)) {
            case VocabularyUtils.TERM:
                return new Term(data as TermData);
            case VocabularyUtils.VOCABULARY:
                return new Vocabulary(data as VocabularyData);
            case VocabularyUtils.DOCUMENT:
                return new Document(data as DocumentData);
            case VocabularyUtils.FILE:
                return new File(data as FileData);
            case VocabularyUtils.RESOURCE:
                return new Resource(data as ResourceData);
            default:
                throw new TypeError("Unsupported type of asset data " + JSON.stringify(data));
        }
    },

    /**
     * Creates an instance of the appropriate Resource (sub)type based on the specified data.
     *
     * @param data Data for Resource instantiation
     */
    createResource(data: ResourceData): Resource {
        switch (Utils.getPrimaryAssetType(data)) {
            case VocabularyUtils.DOCUMENT:
                return new Document(data as DocumentData);
            case VocabularyUtils.FILE:
                return new File(data as FileData);
            case VocabularyUtils.RESOURCE:
                return new Resource(data);
            default:
                throw new TypeError("Unsupported type of resource data " + JSON.stringify(data));
        }
    },

    /**
     * Creates an instance of TermAssignment or TermOccurrence based on the specified data.
     * @param data Data instantiation
     */
    createTermAssignment(data: TermAssignmentData): TermAssignment {
        const types = Utils.sanitizeArray(data.types);
        if (types.indexOf(VocabularyUtils.TERM_OCCURRENCE) !== -1) {
            return new TermOccurrence(data as TermOccurrenceData);
        } else if (types.indexOf(VocabularyUtils.TERM_ASSIGNMENT) !== -1) {
            return new TermAssignment(data);
        }
        throw new TypeError("Unsupported type of assignment data " + JSON.stringify(data));
    },

    /**
     * Creates an object with empty values for TermData attributes.
     *
     * That is, string-based attributes (iri, label etc.) will be empty strings, array-valued attributes (types,
     * sources, parentTerms) will be empty arrays.
     *
     * @param lang Language to use for multilingual attribute default values (optional)
     */
    createEmptyTermData(lang?: string): TermData {
        return {
            iri: "",
            label: langString("", lang),
            definition: langString("", lang),
            scopeNote: langString("", lang),
            types: [],
            sources: [],
            parentTerms: [],
            draft: true
        };
    },

    /**
     * Creates an instance of a suitable ChangeRecord subclass based on the specified data.
     * @param data Instance data
     */
    createChangeRecord(data: ChangeRecordData): ChangeRecord {
        if (data.types.indexOf(VocabularyUtils.PERSIST_EVENT) !== -1) {
            return new PersistRecord(data);
        } else if (data.types.indexOf(VocabularyUtils.UPDATE_EVENT) !== -1) {
            return new UpdateRecord(data as UpdateRecordData);
        }
        throw new TypeError("Unsupported type of change record data " + JSON.stringify(data));
    }
};

export default AssetFactory;

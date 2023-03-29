import { AssetData } from "../../model/Asset";
import Generator from "../../__tests__/environment/Generator";
import AssetFactory from "../AssetFactory";
import VocabularyUtils from "../VocabularyUtils";
import Term from "../../model/Term";
import Vocabulary from "../../model/Vocabulary";
import Document from "../../model/Document";
import File from "../../model/File";
import Resource, { ResourceData } from "../../model/Resource";
import TermAssignment from "../../model/TermAssignment";
import TermOccurrence from "../../model/TermOccurrence";
import { ChangeRecordData } from "../../model/changetracking/ChangeRecord";
import PersistRecord from "../../model/changetracking/PersistRecord";
import {
  UpdateRecord,
  UpdateRecordData,
} from "../../model/changetracking/UpdateRecord";
import { langString } from "../../model/MultilingualString";
import {
  AccessControlRecord,
  UserAccessControlRecord,
  UserGroupAccessControlRecord,
  UserRoleAccessControlRecord,
} from "../../model/AccessControlList";
import { UserGroupData } from "../../model/UserGroup";
import { UserRoleData } from "../../model/UserRole";

describe("AssetFactory", () => {
  describe("createAsset", () => {
    const basicData: AssetData = {
      iri: Generator.generateUri(),
    };

    it("creates correct asset instance based on data", () => {
      expect(
        AssetFactory.createAsset(
          Object.assign({}, basicData, {
            label: langString("Test"),
            types: VocabularyUtils.TERM,
          })
        )
      ).toBeInstanceOf(Term);
      expect(
        AssetFactory.createAsset(
          Object.assign({}, basicData, {
            label: "Test",
            types: VocabularyUtils.VOCABULARY,
          })
        )
      ).toBeInstanceOf(Vocabulary);
      expect(
        AssetFactory.createAsset(
          Object.assign({}, basicData, {
            label: "Test",
            types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE],
          })
        )
      ).toBeInstanceOf(Document);
      expect(
        AssetFactory.createAsset(
          Object.assign({}, basicData, {
            types: [VocabularyUtils.RESOURCE, VocabularyUtils.FILE],
          })
        )
      ).toBeInstanceOf(File);
      expect(
        AssetFactory.createAsset(
          Object.assign({}, basicData, {
            types: [VocabularyUtils.RESOURCE],
          })
        )
      ).toBeInstanceOf(Resource);
    });

    it("throws unsupported asset type exception when data of unknown type are passed in", () => {
      expect(() => AssetFactory.createAsset(basicData)).toThrow(
        new TypeError(
          "Unsupported type of asset data " + JSON.stringify(basicData)
        )
      );
    });
  });

  describe("createResource", () => {
    const basicData: ResourceData = {
      iri: Generator.generateUri(),
      label: "Test",
    };

    it("creates correct resource (sub)type instance from data", () => {
      expect(
        AssetFactory.createResource(
          Object.assign({}, basicData, {
            types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE],
          })
        )
      ).toBeInstanceOf(Document);
      expect(
        AssetFactory.createResource(
          Object.assign({}, basicData, {
            types: [VocabularyUtils.RESOURCE, VocabularyUtils.FILE],
          })
        )
      ).toBeInstanceOf(File);
      expect(
        AssetFactory.createResource(
          Object.assign({}, basicData, {
            types: [VocabularyUtils.RESOURCE],
          })
        )
      ).toBeInstanceOf(Resource);
    });

    it("throws unsupported asset type exception when data of unknown type are passed in", () => {
      const data = Object.assign({}, basicData, {
        types: VocabularyUtils.TERM,
      });
      expect(() => AssetFactory.createResource(data)).toThrow(
        new TypeError(
          "Unsupported type of resource data " + JSON.stringify(data)
        )
      );
    });
  });

  describe("createTermAssignment", () => {
    const data = {
      iri: "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/prirazeni-termu/instance1741423723",
      types: [
        "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/přiřazení-termu",
      ],
      term: {
        iri: "http://onto.fel.cvut.cz/ontologies/slovnik/sb-z-2006-183/pojem/nezastavene-uzemi",
        types: [
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/term",
        ],
        label: "Nezastavene uzemi",
      },
      target: {
        iri: "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/cil/instance-873441519",
        types: [
          "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/cíl",
        ],
        source: {
          iri: "http://onto.fel.cvut.cz/ontologies/zdroj/ml-test",
          types: [
            "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/zdroj",
          ],
          label: "ML test",
          author: {
            iri: "http://onto.fel.cvut.cz/ontologies/uzivatel/catherine-halsey",
            types: [
              "http://onto.fel.cvut.cz/ontologies/application/termit/uzivatel-termitu",
            ],
            firstName: "Catherine",
            lastName: "Halsey",
            username: "halsey@unsc.org",
          },
          created: 1548760789068,
        },
      },
    };

    it("creates term assignment when data are for assignment only", () => {
      const result = AssetFactory.createTermAssignment(data as any);
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(TermAssignment);
    });

    it("creates term occurrence when data contain occurrence type", () => {
      data.types = [VocabularyUtils.TERM_OCCURRENCE, ...data.types];
      const result = AssetFactory.createTermAssignment(data as any);
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(TermOccurrence);
    });

    it("throws unsupported type exception when data of unknown type are passed in", () => {
      data.types = [];
      expect(() => AssetFactory.createTermAssignment(data as any)).toThrow(
        new TypeError(
          "Unsupported type of assignment data " + JSON.stringify(data)
        )
      );
    });
  });

  describe("createChangeRecord", () => {
    const changeClass = `${VocabularyUtils.PREFIX}zm\u011bna`;

    it("creates a persist record for persist event data", () => {
      const persistRecord: ChangeRecordData = {
        iri: Generator.generateUri(),
        timestamp: new Date().toISOString(),
        author: Generator.generateUser(),
        changedEntity: { iri: Generator.generateUri() },
        types: [changeClass, VocabularyUtils.PERSIST_EVENT],
      };
      const result = AssetFactory.createChangeRecord(persistRecord);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(PersistRecord);
    });

    it("creates an update record for update event data", () => {
      const updateRecord: UpdateRecordData = {
        iri: Generator.generateUri(),
        timestamp: new Date().toISOString(),
        author: Generator.generateUser(),
        changedEntity: { iri: Generator.generateUri() },
        changedAttribute: { iri: VocabularyUtils.SKOS_PREF_LABEL },
        newValue: "Test term",
        types: [changeClass, VocabularyUtils.UPDATE_EVENT],
      };
      const result = AssetFactory.createChangeRecord(updateRecord);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(UpdateRecord);
    });

    it("throws a type error if an invalid record type is provided in data", () => {
      const record: ChangeRecordData = {
        iri: Generator.generateUri(),
        timestamp: new Date().toISOString(),
        author: Generator.generateUser(),
        changedEntity: { iri: Generator.generateUri() },
        types: [changeClass],
      };
      expect(() => AssetFactory.createChangeRecord(record)).toThrow(
        new TypeError(
          "Unsupported type of change record data " + JSON.stringify(record)
        )
      );
    });
  });

  describe("createAccessControlRecord", () => {
    it("creates UserAccessControlRecord for User holder", () => {
      const data = {
        holder: Generator.generateUser(),
        level: Generator.generateUri(),
      } as AccessControlRecord<any>;
      expect(AssetFactory.createAccessControlRecord(data)).toBeInstanceOf(
        UserAccessControlRecord
      );
    });

    it("creates UserGroupAccessControlRecord for UserGroup holder", () => {
      const data = {
        holder: {
          iri: Generator.generateUri(),
          label: "Test group",
          types: [VocabularyUtils.USER_GROUP],
        } as UserGroupData,
        level: Generator.generateUri(),
      } as AccessControlRecord<any>;
      expect(AssetFactory.createAccessControlRecord(data)).toBeInstanceOf(
        UserGroupAccessControlRecord
      );
    });

    it("creates UserRoleAccessControlRecord for UserRole holder", () => {
      const data = {
        holder: {
          iri: Generator.generateUri(),
          label: langString("Test role"),
          types: [VocabularyUtils.USER_ROLE],
        } as UserRoleData,
        level: Generator.generateUri(),
      } as AccessControlRecord<any>;
      expect(AssetFactory.createAccessControlRecord(data)).toBeInstanceOf(
        UserRoleAccessControlRecord
      );
    });
  });
});

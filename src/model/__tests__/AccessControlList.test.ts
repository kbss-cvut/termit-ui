import {
  AbstractAccessControlRecord,
  AccessControlRecordData,
} from "../AccessControlList";
import Generator from "../../__tests__/environment/Generator";
import { langString } from "../MultilingualString";
import VocabularyUtils from "../../util/VocabularyUtils";
import { UserData } from "../User";
import UserGroup, { UserGroupData } from "../UserGroup";

describe("AbstractAccessControlRecord", () => {
  describe("create", () => {
    it("sets firstName and lastName of User holder from label of AccessControlRecordData", () => {
      const user = Generator.generateUser();
      const data: AccessControlRecordData = {
        iri: Generator.generateUri(),
        accessLevel:
          "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/\u00farove\u0148-p\u0159\u00edstupov\u00fdch-opr\u00e1vn\u011bn\u00ed/z\u00e1pis",
        holder: {
          iri: user.iri,
          label: langString(`${user.firstName} ${user.lastName}`, "cs"),
          types: [VocabularyUtils.USER],
        },
        types: [VocabularyUtils.USER_ACCESS_RECORD],
      };
      const result = AbstractAccessControlRecord.create(data);
      expect(result.iri).toEqual(data.iri);
      expect((result.holder as UserData).firstName).toEqual(user.firstName);
      expect((result.holder as UserData).lastName).toEqual(user.lastName);
      expect(result.types).toEqual(data.types);
    });

    it("sets label of UserGroup holder from label of AccessControlRecordData", () => {
      const group = new UserGroup({
        iri: Generator.generateUri(),
        label: "Test group",
        members: [],
        types: [VocabularyUtils.USER_GROUP],
      });
      const data: AccessControlRecordData = {
        iri: Generator.generateUri(),
        accessLevel:
          "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/\u00farove\u0148-p\u0159\u00edstupov\u00fdch-opr\u00e1vn\u011bn\u00ed/z\u00e1pis",
        holder: {
          iri: group.iri!,
          label: langString(group.label, "cs"),
          types: [VocabularyUtils.USER_GROUP],
        },
        types: [VocabularyUtils.USERGROUP_ACCESS_RECORD],
      };
      const result = AbstractAccessControlRecord.create(data);
      expect(result.iri).toEqual(data.iri);
      expect((result.holder as UserGroupData).label).toEqual(group.label);
      expect(result.types).toEqual(data.types);
    });
  });
});

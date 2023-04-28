import Generator from "../../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import {
  AccessControlRecord,
  AccessHolderType,
} from "../../../../model/acl/AccessControlList";
import * as Redux from "react-redux";
import { shallow } from "enzyme";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import AccessControlRecordForm from "../AccessControlRecordForm";
import User from "../../../../model/User";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import RdfsResource from "../../../../model/RdfsResource";
import AccessControlHolderSelector from "../AccessControlHolderSelector";
import UserRole from "../../../../model/UserRole";
import { langString } from "../../../../model/MultilingualString";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

const ACCESS_LEVELS = [
  {
    iri: "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/úroveň-přístupových-oprávnění/žádná",
    label: {
      en: "Access level - None",
    },
  },
  {
    iri: "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/úroveň-přístupových-oprávnění/čtení",
    label: {
      en: "Access level - Read",
    },
  },
  {
    iri: "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/úroveň-přístupových-oprávnění/zápis",
    label: {
      en: "Access level - Write",
    },
  },
  {
    iri: "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/úroveň-přístupových-oprávnění/správa",
    label: {
      en: "Access level - Security",
    },
  },
];

describe("AccessControlRecordForm", () => {
  let onChange: (change: Partial<AccessControlRecord<any>>) => void;

  beforeEach(() => {
    mockUseI18n();
    onChange = jest.fn();
    jest.spyOn(Redux, "useSelector").mockReturnValue(ACCESS_LEVELS);
  });

  it("offers Security access level for regular full user", () => {
    const holder = Generator.generateUser();
    const wrapper = shallow(
      <AccessControlRecordForm
        record={
          {
            holder: holder,
            types: [VocabularyUtils.USER_ACCESS_RECORD],
          } as AccessControlRecord<User>
        }
        onChange={onChange}
      />
    );
    const levelSelector = wrapper.find(IntelligentTreeSelect);
    expect(levelSelector.prop("options") as RdfsResource[]).toEqual(
      ACCESS_LEVELS
    );
  });

  function generateRestrictedUser() {
    const user = Generator.generateUser();
    user.types.push(VocabularyUtils.USER_RESTRICTED);
    return user;
  }

  it.each([
    [generateRestrictedUser(), VocabularyUtils.USER_ACCESS_RECORD],
    [Generator.generateUserGroup(), VocabularyUtils.USERGROUP_ACCESS_RECORD],
    [
      new UserRole({
        iri: VocabularyUtils.NS_TERMIT + "omezen\u00fd-u\u017eivatel-termitu",
        label: langString("Reader"),
        types: [VocabularyUtils.USER_ROLE],
      }),
      VocabularyUtils.USERROLE_ACCESS_RECORD,
    ],
  ])(
    "does not offer Security access level for holder %s",
    (holder: AccessHolderType, recordType: string) => {
      const wrapper = shallow(
        <AccessControlRecordForm
          record={
            {
              holder: holder,
              types: [recordType],
            } as AccessControlRecord<AccessHolderType>
          }
          onChange={onChange}
        />
      );
      const levelSelector = wrapper.find(IntelligentTreeSelect);
      expect(levelSelector.prop("options")).not.toContain(
        ACCESS_LEVELS[ACCESS_LEVELS.length - 1]
      );
    }
  );

  it("resets accessLevel when level is Security and holder changes to restricted user", () => {
    const holder = Generator.generateUser();
    const wrapper = shallow(
      <AccessControlRecordForm
        record={
          {
            holder: holder,
            accessLevel: ACCESS_LEVELS[ACCESS_LEVELS.length - 1].iri,
            types: [VocabularyUtils.USER_ACCESS_RECORD],
          } as AccessControlRecord<User>
        }
        onChange={onChange}
      />
    );
    const restrictedHolder = Generator.generateUser();
    restrictedHolder.types.push(VocabularyUtils.USER_RESTRICTED);
    wrapper.find(AccessControlHolderSelector).prop("onChange")(
      restrictedHolder
    );
    expect(onChange).toHaveBeenCalledWith({
      holder: restrictedHolder,
      types: [VocabularyUtils.USER],
      accessLevel: undefined,
    });
  });
});

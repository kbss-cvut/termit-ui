import Generator from "../../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import {
  AccessControlRecord,
  AccessHolderType,
} from "../../../../model/acl/AccessControlList";
import * as Redux from "react-redux";
import AccessControlRecordForm from "../AccessControlRecordForm";
import User from "../../../../model/User";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import RdfsResource from "../../../../model/RdfsResource";
import UserRole from "../../../../model/UserRole";
import { langString } from "../../../../model/MultilingualString";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

const mocks = vi.hoisted(() => ({
  selectProps: {} as any,
  holderSelectorProps: {} as any,
}));
vi.mock("intelligent-tree-select", () => ({
  IntelligentTreeSelect: (props: any) => {
    mocks.selectProps = props;
    return <div data-testid="tree-select" />;
  },
}));
vi.mock("../AccessControlHolderSelector", () => ({
  default: (props: any) => {
    mocks.holderSelectorProps = props;
    return <div data-testid="holder-selector" />;
  },
}));

const ACCESS_LEVELS = [
  {
    iri: "http://onto.fel.cvut.cz/ontologies/application/termit/access-level/none",
    label: {
      en: "Access level - None",
    },
  },
  {
    iri: "http://onto.fel.cvut.cz/ontologies/application/termit/access-level/read",
    label: {
      en: "Access level - Read",
    },
  },
  {
    iri: "http://onto.fel.cvut.cz/ontologies/application/termit/access-level/write",
    label: {
      en: "Access level - Write",
    },
  },
  {
    iri: "http://onto.fel.cvut.cz/ontologies/application/termit/access-level/security",
    label: {
      en: "Access level - Security",
    },
  },
];

describe("AccessControlRecordForm", () => {
  let onChange: (change: Partial<AccessControlRecord<any>>) => void;

  beforeEach(() => {
    mockUseI18n();
    onChange = vi.fn();
    vi.spyOn(Redux, "useSelector").mockReturnValue(ACCESS_LEVELS);
  });

  it("offers Security access level for regular full user", () => {
    const holder = Generator.generateUser();
    renderWithIntl(
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
    expect(mocks.selectProps.options as RdfsResource[]).toEqual(ACCESS_LEVELS);
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
        iri: VocabularyUtils.USER_RESTRICTED,
        label: langString("Reader"),
        types: [VocabularyUtils.USER_ROLE],
      }),
      VocabularyUtils.USERROLE_ACCESS_RECORD,
    ],
  ])(
    "does not offer Security access level for holder %s",
    (holder: AccessHolderType, recordType: string) => {
      renderWithIntl(
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
      expect(mocks.selectProps.options).not.toContain(
        ACCESS_LEVELS[ACCESS_LEVELS.length - 1]
      );
    }
  );

  it("resets accessLevel when level is Security and holder changes to restricted user", () => {
    const holder = Generator.generateUser();
    renderWithIntl(
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
    mocks.holderSelectorProps.onChange(restrictedHolder);
    expect(onChange).toHaveBeenCalledWith({
      holder: restrictedHolder,
      types: [VocabularyUtils.USER],
      accessLevel: undefined,
    });
  });
});

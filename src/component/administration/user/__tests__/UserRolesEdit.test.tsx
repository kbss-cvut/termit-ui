import User from "../../../../model/User";
import UserRole, { UserRoleData } from "../../../../model/UserRole";
import Generator from "../../../../__tests__/environment/Generator";
import { mountWithIntlAttached } from "../../../annotator/__tests__/AnnotationUtil";
import UserRolesEdit from "../UserRolesEdit";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import * as UserActions from "../../../../action/AsyncUserActions";
import * as Redux from "react-redux";
import { langString } from "../../../../model/MultilingualString";
import RdfsResource from "../../../../model/RdfsResource";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

// Temporarily disabled due to issues with mocking popper.js
describe.skip("UserRolesEdit", () => {
  const roles: UserRole[] = [
    new UserRole({
      iri: VocabularyUtils.USER_ADMIN,
      label: langString("Admin"),
    }),
    new UserRole({
      iri: VocabularyUtils.USER_EDITOR,
      label: langString("Editor"),
    }),
    new UserRole({
      iri: VocabularyUtils.USER_RESTRICTED,
      label: langString("Reader"),
    }),
  ];

  let user: User;
  let onCancel: () => void;
  let onSubmit: (role: UserRoleData) => void;

  beforeEach(() => {
    user = Generator.generateUser();
    onCancel = vi.fn();
    onSubmit = vi.fn();
  });

  it("disables submit button when selected role is reader and user has managed assets", async () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(roles);
    vi.spyOn(UserActions, "loadManagedAssets");
    const mockDispatch = vi.fn().mockResolvedValue([
      new RdfsResource({
        iri: Generator.generateUri(),
        label: langString("Test vocabulary"),
        types: [VocabularyUtils.VOCABULARY],
      }),
    ]);
    vi.spyOn(Redux, "useDispatch").mockReturnValue(mockDispatch);
    user.types.push(VocabularyUtils.USER_EDITOR);
    const wrapper = mountWithIntlAttached(
      <MemoryRouter>
        <UserRolesEdit
          user={user}
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </MemoryRouter>
    );
    expect(
      wrapper.find("button#role-edit-submit").prop("disabled")
    ).toBeFalsy();
    await act(() => {
      wrapper.find("select").simulate("change", {
        target: { value: VocabularyUtils.USER_RESTRICTED },
      });
      return Promise.resolve().then(() => {
        wrapper.update();
        expect(
          wrapper.find("button#role-edit-submit").prop("disabled")
        ).toBeTruthy();
      });
    });
  });
});

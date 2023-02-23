import VocabularyUtils from "../../../../util/VocabularyUtils";
import { shallow } from "enzyme";
import Generator from "../../../../__tests__/environment/Generator";
import UserStatusInfo from "../UserStatusInfo";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";

describe("UserStatusInfo", () => {
  it("renders admin user with admin badge", () => {
    mockUseI18n();
    const user = Generator.generateUser();
    user.types.push(VocabularyUtils.USER_ADMIN);
    const wrapper = shallow(<UserStatusInfo user={user} />);
    expect(wrapper.exists(".m-user-admin")).toBeTruthy();
  });
});

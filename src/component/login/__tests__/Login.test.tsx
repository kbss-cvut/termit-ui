import * as React from "react";
import {Login} from "../Login";
import ErrorInfo from "../../../model/ErrorInfo";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import ActionType, {AsyncFailureAction, MessageAction} from "../../../action/ActionType";
import {Alert} from "reactstrap";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {shallow} from "enzyme";
import {MemoryRouter} from "react-router";
import * as Constants from "../../../util/Constants";
import ConfigParam from "../../../util/ConfigParam";

jest.mock("../../../util/Routing");

describe("Login", () => {
    let login: (username: string, password: string) => Promise<MessageAction | AsyncFailureAction>;

    beforeEach(() => {
        login = jest.fn().mockImplementation(() => Promise.resolve({}));
    });

    afterEach(() => {
        delete process.env.REACT_APP_ADMIN_REGISTRATION_ONLY;
    });

    it("renders submit button disabled when either field is empty", () => {
        const wrapper = mountWithIntl(
            <MemoryRouter>
                <Login loading={false} login={login} {...intlFunctions()} />
            </MemoryRouter>
        );
        const button = wrapper.find("button#login-submit");
        expect(button.getElement().props.disabled).toBeTruthy();
        const usernameInput = wrapper.find('input[name="username"]');
        const passwordInput = wrapper.find('input[name="password"]');
        (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
        usernameInput.simulate("change", usernameInput);
        expect(button.getElement().props.disabled).toBeTruthy();
        (usernameInput.getDOMNode() as HTMLInputElement).value = "";
        usernameInput.simulate("change", usernameInput);
        (passwordInput.getDOMNode() as HTMLInputElement).value = "aaaa";
        passwordInput.simulate("change", passwordInput);
        expect(button.getElement().props.disabled).toBeTruthy();
    });

    it("enables submit button when both fields are non-empty", () => {
        const wrapper = mountWithIntl(
            <MemoryRouter>
                <Login loading={false} login={login} {...intlFunctions()} />
            </MemoryRouter>
        );
        const button = wrapper.find("button#login-submit");
        expect(button.getElement().props.disabled).toBeTruthy();
        const usernameInput = wrapper.find('input[name="username"]');
        const passwordInput = wrapper.find('input[name="password"]');
        (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
        usernameInput.simulate("change", usernameInput);
        (passwordInput.getDOMNode() as HTMLInputElement).value = "aaaa";
        passwordInput.simulate("change", passwordInput);
        expect(wrapper.find("button#login-submit").getElement().props.disabled).toBeFalsy();
    });

    it("invokes login when enter is pressed", () => {
        const wrapper = mountWithIntl(
            <MemoryRouter>
                <Login loading={false} login={login} {...intlFunctions()} />
            </MemoryRouter>
        );
        const usernameInput = wrapper.find('input[name="username"]');
        const passwordInput = wrapper.find('input[name="password"]');
        (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
        usernameInput.simulate("change", usernameInput);
        (passwordInput.getDOMNode() as HTMLInputElement).value = "aaaa";
        passwordInput.simulate("change", passwordInput);
        passwordInput.simulate("keyPress", {key: "Enter"});
        expect(login).toHaveBeenCalled();
    });

    it("does not invoke login when enter is pressed and one field is invalid", () => {
        const wrapper = mountWithIntl(
            <MemoryRouter>
                <Login loading={false} login={login} {...intlFunctions()} />
            </MemoryRouter>
        );
        const usernameInput = wrapper.find('input[name="username"]');
        const passwordInput = wrapper.find('input[name="password"]');
        (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
        usernameInput.simulate("change", usernameInput);
        passwordInput.simulate("keyPress", {key: "Enter"});
        expect(login).not.toHaveBeenCalled();
    });

    it("renders alert with error when error is set", () => {
        const error = new ErrorInfo(ActionType.LOGIN, {});
        const wrapper = shallow<Login>(<Login loading={false} login={login} {...intlFunctions()} />);
        wrapper.setState({error});
        wrapper.update();
        const alert = wrapper.find(Alert);
        expect(alert.exists()).toBeTruthy();
    });

    it("clears error on user input", () => {
        const error = new ErrorInfo(ActionType.LOGIN, {});
        const wrapper = mountWithIntl(
            <MemoryRouter>
                <Login loading={false} login={login} {...intlFunctions()} />
            </MemoryRouter>
        );
        (wrapper.find(Login).instance() as Login).setState({error});
        wrapper.update();
        const usernameInput = wrapper.find('input[name="username"]');
        (usernameInput.getDOMNode() as HTMLInputElement).value = "aaaa";
        usernameInput.simulate("change", usernameInput);
        wrapper.update();
        expect((wrapper.find(Login).instance() as Login).state.error).toBeNull();
    });

    it("renders registration link by default", () => {
        jest.spyOn(Constants, "getEnv").mockImplementation((name: string) => {
            return (name !== ConfigParam.ADMIN_REGISTRATION_ONLY).toString();
        });
        const wrapper = mountWithIntl(
            <MemoryRouter>
                <Login loading={false} login={login} {...intlFunctions()} />
            </MemoryRouter>
        );
        expect(wrapper.exists("#login-register")).toBeTruthy();
    });

    it("does not render registration link when admin registration only is turned on", () => {
        jest.spyOn(Constants, "getEnv").mockReturnValue(true.toString());
        const wrapper = mountWithIntl(
            <MemoryRouter>
                <Login loading={false} login={login} {...intlFunctions()} />
            </MemoryRouter>
        );
        expect(wrapper.exists("#login-register")).toBeFalsy();
    });
});

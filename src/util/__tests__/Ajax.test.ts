import MockAdapter from "axios-mock-adapter";
import {
  accept,
  Ajax,
  content,
  ifModifiedSince,
  param,
  params,
  paramsSerializer,
} from "../Ajax";
import Routing from "../Routing";
import { EMPTY_USER } from "../../model/User";
import Constants from "../Constants";
import * as Const from "../Constants";
import Routes from "../Routes";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ErrorData } from "../../model/ErrorInfo";
import Authentication from "../Authentication";
import VocabularyUtils from "../VocabularyUtils";
import Generator from "../../__tests__/environment/Generator";

jest.mock("../Routing");
jest.mock("../Authentication");
jest.mock("../BrowserStorage");

export class MockableAjax extends Ajax {
  get axios(): AxiosInstance {
    return this.axiosInstance;
  }
}

describe("Ajax", () => {
  const sut = new MockableAjax();
  const mock = new MockAdapter(sut.axios);
  const jwt = "12345";

  let headers: {};

  beforeEach(() => {
    mock.reset();
    headers = {};
    headers[Constants.Headers.AUTHORIZATION] = jwt;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads JWT and sets it on request", () => {
    Authentication.loadToken = jest.fn().mockReturnValue(jwt);
    mock.onGet("/users/current").reply((config: AxiosRequestConfig) => {
      expect(config.headers[Constants.Headers.AUTHORIZATION]).toContain(jwt);
      return [200, require("../../rest-mock/current"), headers];
    });
    return sut.get("/users/current");
  });

  it("extracts current JWT from response and saves it using Authentication", () => {
    headers[Constants.Headers.AUTHORIZATION] = jwt;
    Authentication.saveToken = jest.fn();
    mock
      .onGet("/users/current")
      .reply(200, require("../../rest-mock/current"), headers);
    return sut.get("/users/current").then(() => {
      expect(Authentication.saveToken).toHaveBeenCalledWith(jwt);
    });
  });

  it("does not extract JWT when there is none in response", () => {
    Authentication.saveToken = jest.fn();
    mock.onGet("/users/username").reply(200, false);
    return sut.get("/users/username").then(() => {
      expect(Authentication.saveToken).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    const oldEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...oldEnv }; // make a copy
    });

    afterEach(() => {
      process.env = oldEnv;
    });

    it("directly transitions to login route when 401 Unauthorized is received", () => {
      jest.spyOn(Const, "getEnv").mockReturnValue(false.toString());
      mock.onGet("/users/current").reply(Constants.STATUS_UNAUTHORIZED);
      return sut.get("/users/current").catch(() => {
        return expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.login);
      });
    });

    it("transitions to public dashboard route when 401 Unauthorized is received and public view is preferred over login", () => {
      jest.spyOn(Const, "getEnv").mockReturnValue(true.toString());
      mock.onGet("/users/current").reply(Constants.STATUS_UNAUTHORIZED);
      return sut.get("/users/current").catch(() => {
        return expect(Routing.transitionTo).toHaveBeenCalledWith(
          Routes.publicDashboard
        );
      });
    });

    it("saves original navigation target when transitioning to login route after receiving 401 Unauthorized", () => {
      jest.spyOn(Const, "getEnv").mockReturnValue(false.toString());
      mock.onGet("/users/current").reply(Constants.STATUS_UNAUTHORIZED);
      return sut.get("/users/current").catch(() => {
        expect(Routing.saveOriginalTarget).toHaveBeenCalled();
        return expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.login);
      });
    });

    it("returns connection error object when network error occurs", () => {
      mock.onAny().networkError();
      return sut.get("/users/current").catch((error) => {
        expect(error.messageId).toBeDefined();
        return expect(error.messageId).toEqual("connection.error");
      });
    });

    it("returns error object when it is error info in JSON", () => {
      const errorObj = {
        message: "Validation of record failed",
        requestUrl: "/users/current",
      };
      mock.onAny().reply(409, errorObj);
      return sut.put("/users/current", content(EMPTY_USER)).catch((error) => {
        expect(error.message).toEqual(errorObj.message);
        return expect(error.requestUrl).toEqual(errorObj.requestUrl);
      });
    });

    it("returns unparseable error info message when response indicates error but its content is not error info in JSON", () => {
      mock
        .onAny()
        .reply(500, '<html lang="en">Fatal error occurred on server</html>');
      return sut.get("/users").catch((error) => {
        expect(error.messageId).toBeDefined();
        return expect(error.messageId).toEqual("ajax.unparseable-error");
      });
    });

    it("provides response status in error info object", () => {
      const status = 409;
      const errorObj = {
        message: "Validation of record failed",
        requestUrl: "/users/current",
      };
      mock.onAny().reply(status, errorObj);
      return sut
        .put("/users/current", content(EMPTY_USER))
        .catch((error: ErrorData) => {
          return expect(error.status).toEqual(status);
        });
    });

    it("provides response status when response content is not parseable JSON error info", () => {
      const status = 500;
      mock
        .onAny()
        .reply(status, '<html lang="en">Fatal error occurred on server</html>');
      return sut.get("/users").catch((error) => {
        expect(error.status).toEqual(status);
        return expect(error.messageId).toEqual("ajax.unparseable-error");
      });
    });
  });

  describe("request configuration", () => {
    it("puts query parameters into GET request url", () => {
      const qParams = {
        page: "1",
        size: "100",
      };
      mock.onAny().reply(200, {}, headers);
      const spy = jest.spyOn(sut.axios, "get");
      spy.mockClear(); // Safeguard because the spy tends to leak into subsequent test specs
      return sut.get("/terms", params(qParams)).then(() => {
        const reqConfig = spy.mock.calls[0][1];
        return expect(reqConfig!.params).toEqual(qParams);
      });
    });

    it("it adds JSON-LD Accept header by default", () => {
      mock.onAny().reply(200, {}, headers);
      const spy = jest.spyOn(sut.axios, "get");
      spy.mockClear();
      return sut.get("/terms/count").then(() => {
        const reqConfig = spy.mock.calls[0][1];
        return expect(reqConfig!.headers[Constants.Headers.ACCEPT]).toEqual(
          Constants.JSON_LD_MIME_TYPE
        );
      });
    });

    it("adds accept header into GET request", () => {
      const acceptType = "text/plain";
      mock.onAny().reply(200, {}, headers);
      const spy = jest.spyOn(sut.axios, "get");
      spy.mockClear();
      return sut.get("/terms/count", accept(acceptType)).then(() => {
        const reqConfig = spy.mock.calls[0][1];
        return expect(reqConfig!.headers[Constants.Headers.ACCEPT]).toEqual(
          acceptType
        );
      });
    });

    it("adds content with specified content type in POST", () => {
      const data = EMPTY_USER;
      const mimeType = "application/json";
      mock.onPost().reply(201, undefined, headers);
      const spy = jest.spyOn(sut.axios, "post");
      spy.mockClear();
      return sut
        .post("/users", content(data).contentType(mimeType))
        .then(() => {
          const reqData = spy.mock.calls[0][1];
          const reqConfig = spy.mock.calls[0][2];
          expect(reqData).toEqual(data);
          return expect(
            reqConfig!.headers[Constants.Headers.CONTENT_TYPE]
          ).toEqual(mimeType);
        });
    });

    it("adds form params to POST as URLSearchParams", () => {
      const formData = {
        username: "halsey@unsc.org",
        password: "117",
      };
      mock.onPost().reply(201, undefined, headers);
      const spy = jest.spyOn(sut.axios, "post");
      spy.mockClear();
      return sut
        .post(
          "/users",
          params(formData).contentType(Constants.X_WWW_FORM_URLENCODED)
        )
        .then(() => {
          const reqConfig = spy.mock.calls[0][2];
          expect(reqConfig!.headers[Constants.Headers.CONTENT_TYPE]).toEqual(
            Constants.X_WWW_FORM_URLENCODED
          );
          const expParams = new URLSearchParams();
          expParams.append("username", formData.username);
          expParams.append("password", formData.password);
          return expect(spy.mock.calls[0][1]).toEqual(expParams);
        });
    });

    it("adds content with specified content type in PUT", () => {
      const data = EMPTY_USER;
      const mimeType = "application/json";
      mock.onPut().reply(204, undefined, headers);
      const spy = jest.spyOn(sut.axios, "put");
      spy.mockClear();
      return sut
        .put("/users/current", content(data).contentType(mimeType))
        .then(() => {
          const reqData = spy.mock.calls[0][1];
          const reqConfig = spy.mock.calls[0][2];
          expect(reqData).toEqual(data);
          return expect(
            reqConfig!.headers[Constants.Headers.CONTENT_TYPE]
          ).toEqual(mimeType);
        });
    });

    it("adds accept header in PUT", () => {
      const mimeType = "text/plain";
      mock.onPut().reply(204, undefined, headers);
      const spy = jest.spyOn(sut.axios, "put");
      spy.mockClear();
      return sut.put("/users/status", accept(mimeType)).then(() => {
        const reqConfig = spy.mock.calls[0][2];
        return expect(reqConfig!.headers[Constants.Headers.ACCEPT]).toEqual(
          mimeType
        );
      });
    });

    it("adds params in PUT", () => {
      const qParams = {
        key: "http://kbss.felk.cvut.cz/termit/users/Catherine+Halsey",
      };
      const data = EMPTY_USER;
      mock.onPut().reply(204, undefined, headers);
      const spy = jest.spyOn(sut.axios, "put");
      spy.mockClear();
      return sut
        .put("/users/current", content(data).params(qParams))
        .then(() => {
          const reqData = spy.mock.calls[0][1];
          const reqConfig = spy.mock.calls[0][2];
          expect(reqData).toEqual(data);
          expect(reqConfig!.headers[Constants.Headers.CONTENT_TYPE]).toEqual(
            Constants.JSON_LD_MIME_TYPE
          );
          return expect(reqConfig!.params).toEqual(qParams);
        });
    });

    it("adds params in DELETE", () => {
      const qParams = {
        key: "http://kbss.felk.cvut.cz/termit/users/Catherine+Halsey",
      };
      mock.onDelete().reply(204, undefined, headers);
      const spy = jest.spyOn(sut.axios, "delete");
      spy.mockClear();
      return sut.delete("/users", params(qParams)).then(() => {
        const reqConfig = spy.mock.calls[0][1];
        return expect(reqConfig!.params).toEqual(qParams);
      });
    });

    it("supports adding params one by one", () => {
      mock.onAny().reply(200, {}, headers);
      const spy = jest.spyOn(sut.axios, "get");
      spy.mockClear();
      const pOne = "searchString";
      const vOne = "test";
      const pTwo = "namespace";
      const vTwo = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies";
      return sut.get("/terms", param(pOne, vOne).param(pTwo, vTwo)).then(() => {
        const reqConfig = spy.mock.calls[0][1];
        const expected = {};
        expected[pOne] = vOne;
        expected[pTwo] = vTwo;
        return expect(reqConfig!.params).toEqual(expected);
      });
    });

    it("adds content as request body in DELETE", () => {
      const data = "new-password";
      mock.onDelete().reply(204, undefined, headers);
      const spy = jest.spyOn(sut.axios, "delete");
      spy.mockClear();
      return sut.delete("/users", content(data)).then(() => {
        const reqConfig = spy.mock.calls[0][1];
        return expect(reqConfig!.data).toEqual(data);
      });
    });

    it("supports adding If-Modified-Since HTTP header", () => {
      mock.onAny().reply(200, {}, headers);
      const spy = jest.spyOn(sut.axios, "get");
      spy.mockClear();
      const ifModSince = new Date().toString();
      return sut
        .getResponse("/vocabularies", ifModifiedSince(ifModSince))
        .then(() => {
          const reqConfig = spy.mock.calls[0][1];
          expect(reqConfig).toBeDefined();
          return expect(
            reqConfig!.headers[Constants.Headers.IF_MODIFIED_SINCE]
          ).toEqual(ifModSince);
        });
    });
  });

  describe("getRaw", () => {
    it("returns response object", () => {
      mock.onAny().reply(
        200,
        {},
        Object.assign({}, headers, {
          "content-disposition": "attachment; filename=test.txt",
        })
      );
      return sut
        .getRaw("/vocabularies?test/terms", accept(Constants.CSV_MIME_TYPE))
        .then((resp: any) => {
          expect(resp.status).toEqual(200);
          expect(resp.headers).toBeDefined();
          expect(resp.headers[Constants.Headers.CONTENT_DISPOSITION]).toContain(
            "attachment"
          );
        });
    });
  });

  describe("getResponse", () => {
    it("returns response object", () => {
      mock.onAny().reply(200, {}, headers);
      const spy = jest.spyOn(sut.axios, "get");
      spy.mockClear();
      return sut.getResponse("/vocabularies").then((resp: AxiosResponse) => {
        expect(resp.status).toEqual(200);
        expect(resp.headers).toEqual(headers);
      });
    });

    it("treats 304 status NOT as an error", () => {
      mock.onAny().reply(304, undefined, headers);
      const spy = jest.spyOn(sut.axios, "get");
      spy.mockClear();
      return sut
        .getResponse("/vocabularies")
        .then((resp: AxiosResponse) => {
          expect(resp.status).toEqual(304);
          expect(resp.headers).toEqual(headers);
        })
        .catch(() => {
          fail("Should not have been called.");
        });
    });
  });

  describe("head", () => {
    it("performs head request with specified params", () => {
      mock.onHead().reply(204, undefined, headers);
      const spy = jest.spyOn(sut.axios, "head");
      const resourceName = "test.html";
      const namespace = VocabularyUtils.FILE + "/";
      return sut
        .head("/resources/" + resourceName, param("namespace", namespace))
        .then((resp: any) => {
          expect(resp.status).toEqual(204);
          expect(spy.mock.calls.length).toEqual(1);
          const reqConfig = spy.mock.calls[0][1];
          expect(reqConfig).toBeDefined();
          expect(reqConfig!.params.namespace).toEqual(namespace);
        });
    });
  });
});

describe("paramsSerializer", () => {
  it("serializes singular query parameters into request query string", () => {
    const parameters = {
      page: 1,
      size: 10,
      includeImported: true,
      searchString: "test",
    };
    const result = paramsSerializer(parameters);
    expect(result).toEqual(
      "page=1&size=10&includeImported=true&searchString=test"
    );
  });

  it("supports serializing plural query parameters", () => {
    const parameters = {
      includeTerms: ["a", "b", "c"],
    };
    const result = paramsSerializer(parameters);
    expect(result).toEqual("includeTerms=a&includeTerms=b&includeTerms=c");
  });

  it("encodes query parameters before putting them into the query string", () => {
    const parameters = {
      includeTerms: [Generator.generateUri(), Generator.generateUri()],
    };
    const result = paramsSerializer(parameters);
    expect(result).toEqual(
      `includeTerms=${encodeURIComponent(
        parameters.includeTerms[0]
      )}&includeTerms=${encodeURIComponent(parameters.includeTerms[1])}`
    );
  });
});

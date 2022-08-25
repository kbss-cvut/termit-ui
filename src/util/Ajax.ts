import axios, { AxiosInstance, AxiosRequestConfig, ResponseType } from "axios";
import Routing from "./Routing";
import Constants, { getEnv } from "./Constants";
import Routes from "./Routes";
import MockAdapter from "axios-mock-adapter";
import SecurityUtils from "./SecurityUtils";
import fileContent from "../rest-mock/file";
import ConfigParam from "./ConfigParam";

class RequestConfigBuilder {
  private mContent?: any;
  private mParams?: {};
  private mFormData?: {};
  private mResponseType?: ResponseType;
  private mHeaders: {};

  constructor() {
    this.mHeaders = {};
    this.mHeaders[Constants.Headers.CONTENT_TYPE] = Constants.JSON_LD_MIME_TYPE;
    this.mHeaders[Constants.Headers.ACCEPT] = Constants.JSON_LD_MIME_TYPE;
    this.mResponseType = undefined;
  }

  public content(value: any): RequestConfigBuilder {
    this.mContent = value;
    return this;
  }

  public contentType(value: string): RequestConfigBuilder {
    this.mHeaders[Constants.Headers.CONTENT_TYPE] = value;
    return this;
  }

  public params(value: {}): RequestConfigBuilder {
    this.mParams = value;
    return this;
  }

  public formData(value: {}): RequestConfigBuilder {
    this.mFormData = value;
    return this;
  }

  public param(paramName: string, paramValue?: string): RequestConfigBuilder {
    if (paramValue !== undefined) {
      const p = {};
      p[paramName] = paramValue;
      this.mParams = Object.assign({}, this.mParams, p);
    }
    return this;
  }

  public accept(value: string): RequestConfigBuilder {
    this.mHeaders[Constants.Headers.ACCEPT] = value;
    return this;
  }

  public responseType(value: ResponseType): RequestConfigBuilder {
    this.mResponseType = value;
    return this;
  }

  public header(headerName: string, value?: string): RequestConfigBuilder {
    if (value !== undefined) {
      const h = {};
      h[headerName] = value;
      this.headers(h);
    }
    return this;
  }

  public headers(value: {}): RequestConfigBuilder {
    this.mHeaders = Object.assign({}, this.mHeaders, value);
    return this;
  }

  public getContent() {
    return this.mContent;
  }

  public getContentType() {
    return this.mHeaders[Constants.Headers.CONTENT_TYPE];
  }

  public getParams() {
    return this.mParams;
  }

  public getFormData() {
    return this.mFormData;
  }

  public getHeaders() {
    return this.mHeaders;
  }

  /**
   * This should be used sparsely.
   *
   * It is mainly to support downloading binary files.
   */
  public getResponseType() {
    return this.mResponseType;
  }
}

export function content(value: any): RequestConfigBuilder {
  return new RequestConfigBuilder().content(value);
}

export function contentType(value: string): RequestConfigBuilder {
  return new RequestConfigBuilder().contentType(value);
}

export function params(value: {}): RequestConfigBuilder {
  return new RequestConfigBuilder().params(value);
}

export function accept(value: string): RequestConfigBuilder {
  return new RequestConfigBuilder().accept(value);
}

export function param(paramName: string, value?: string) {
  return new RequestConfigBuilder().param(paramName, value);
}

export function header(headerName: string, value?: string) {
  return new RequestConfigBuilder().header(headerName, value);
}

export function headers(value: {}) {
  return new RequestConfigBuilder().headers(value);
}

export function ifModifiedSince(value?: string) {
  return new RequestConfigBuilder().header(
    Constants.Headers.IF_MODIFIED_SINCE,
    value
  );
}

export function paramsSerializer(paramData: {}) {
  const keys = Object.keys(paramData);
  let options = "";

  keys.forEach((key) => {
    const isParamTypeObject = typeof paramData[key] === "object";
    const isParamTypeArray = isParamTypeObject && paramData[key].length >= 0;
    if (!paramData[key]) {
      return;
    }

    if (!isParamTypeObject) {
      options += `${key}=${encodeURIComponent(paramData[key])}&`;
    }

    if (isParamTypeObject && isParamTypeArray) {
      paramData[key].forEach((element: any) => {
        options += `${key}=${encodeURIComponent(element)}&`;
      });
    }
  });

  return options ? options.slice(0, -1) : options;
}

export class Ajax {
  protected axiosInstance = axios.create({
    baseURL: Constants.SERVER_URL,
  });

  constructor() {
    this.axiosInstance.interceptors.request.use((reqConfig) => {
      if (!reqConfig.headers) {
        reqConfig.headers = {};
      }
      reqConfig.headers[Constants.Headers.AUTHORIZATION] =
        SecurityUtils.loadToken();
      reqConfig.withCredentials = true;
      return reqConfig;
    });
    this.axiosInstance.interceptors.response.use(
      (resp) => {
        if (resp.headers && resp.headers[Constants.Headers.AUTHORIZATION]) {
          SecurityUtils.saveToken(
            resp.headers[Constants.Headers.AUTHORIZATION]
          );
        }
        return resp;
      },
      (error) => {
        if (!error.response) {
          return Promise.reject({
            message: error.message ? error.message : undefined,
            messageId: "connection.error",
          });
        }
        const response = error.response;
        if (response.status === Constants.STATUS_UNAUTHORIZED) {
          Routing.saveOriginalTarget();
          SecurityUtils.clearToken();
          if (
            getEnv(ConfigParam.SHOW_PUBLIC_VIEW_ON_UNAUTHORIZED, "") ===
            true.toString()
          ) {
            Routing.transitionTo(Routes.publicDashboard);
          } else {
            Routing.transitionTo(Routes.login);
          }
        }
        if (typeof response.data === "string") {
          return Promise.reject({
            messageId: "ajax.unparseable-error",
            status: response.status,
          });
        } else {
          return Promise.reject(
            Object.assign({}, response.data, {
              status: response.status,
            })
          );
        }
      }
    );
    if (getEnv(ConfigParam.MOCK_REST_API, "") === true.toString()) {
      // Mock backend REST API if the environment is configured to do so
      mockRestApi(this.axiosInstance);
    }
  }

  /**
   * Custom status validator for Axios, which accepts 304 Not Modified as a non-error status.
   * @param status HTTP response status
   */
  private static validateGetStatus(status: number): boolean {
    return (status >= 200 && status < 300) || status === 304;
  }

  /**
   * Performs a HTTP HEAD request and returns the raw Axios response object.
   * @param path URL path
   * @param config Request configuration
   */
  public head(
    path: string,
    config: RequestConfigBuilder = new RequestConfigBuilder()
  ) {
    const conf = {
      params: config.getParams(),
      paramsSerializer,
    };
    return this.axiosInstance.head(path, conf);
  }

  /**
   * Gets response from the server and returns its content.
   */
  public get(
    path: string,
    config: RequestConfigBuilder = new RequestConfigBuilder()
  ) {
    return this.getResponse(path, config).then((resp) => resp.data);
  }

  /**
   * Gets response from the server and returns it.
   */
  public getResponse(
    path: string,
    config: RequestConfigBuilder = new RequestConfigBuilder()
  ) {
    const conf = {
      params: config.getParams(),
      headers: config.getHeaders(),
      responseType: config.getResponseType(),
      validateStatus: Ajax.validateGetStatus,
      paramsSerializer,
    };
    return this.axiosInstance.get(path, conf);
  }

  /**
   * Performs a GET request and returns the raw Axios response object with arraybuffer response type.
   */
  public getRaw(
    path: string,
    config: RequestConfigBuilder = new RequestConfigBuilder()
  ) {
    config.responseType("arraybuffer");
    return this.getResponse(path, config);
  }

  public post(path: string, config: RequestConfigBuilder) {
    const conf = {
      headers: config.getHeaders(),
      paramsSerializer,
    };
    delete conf.headers[Constants.Headers.ACCEPT];
    const par = new URLSearchParams();
    // @ts-ignore
    const paramData: object =
      config.getParams() !== undefined ? config.getParams() : {};
    Object.keys(paramData).forEach((n) => par.append(n, paramData[n]));

    const formData: object =
      config.getFormData() !== undefined ? config.getFormData()! : {};

    if (config.getContentType() === Constants.X_WWW_FORM_URLENCODED) {
      return this.axiosInstance.post(path, par, conf);
    } else if (config.getContentType() === Constants.MULTIPART_FORM_DATA) {
      return this.axiosInstance.post(path, formData, conf);
    } else {
      const query: string = config.getParams() ? "?" + par.toString() : "";
      return this.axiosInstance.post(path + query, config.getContent(), conf);
    }
  }

  public put(path: string, config: RequestConfigBuilder) {
    const conf = {
      params: config.getParams(),
      headers: config.getHeaders(),
      paramsSerializer,
    };
    if (
      config.getContentType() === Constants.MULTIPART_FORM_DATA &&
      config.getFormData()
    ) {
      return this.axiosInstance.put(path, config.getFormData(), conf);
    }
    return this.axiosInstance.put(path, config.getContent(), conf);
  }

  public delete(path: string, config?: RequestConfigBuilder) {
    let conf: any;
    if (config) {
      conf = {
        params: config.getParams(),
        paramsSerializer,
      };
      if (config.getContent()) {
        conf.data = config.getContent();
        conf.headers = config.getHeaders();
        delete conf.headers[Constants.Headers.ACCEPT];
      }
    }
    return this.axiosInstance.delete(path, conf);
  }
}

function mockRestApi(axiosInst: AxiosInstance): void {
  const mock = new MockAdapter(axiosInst, { delayResponse: 500 });
  const respHeaders = {};
  respHeaders[Constants.Headers.AUTHORIZATION] = "12345";

  // Mock term history
  mock
    .onGet(/\/rest\/terms\/.+\/history/)
    .reply(200, require("../rest-mock/termHistory"), respHeaders);
  // Mock current user data
  mock
    .onGet(Constants.API_PREFIX + "/users/current")
    .reply(200, require("../rest-mock/current"), respHeaders);
  // Mock login return value
  mock.onPost("/j_spring_security_check").reply(
    200,
    {
      loggedIn: true,
      success: true,
    },
    respHeaders
  );
  // Mock registration request
  mock.onPost(Constants.API_PREFIX + "/users").reply(201);
  // Mock users retrieval
  mock
    .onGet(Constants.API_PREFIX + "/users")
    .reply(200, require("../rest-mock/users"), respHeaders);
  // Mock username existence check
  mock
    .onGet(Constants.API_PREFIX + "/users/username")
    .reply((config: AxiosRequestConfig) => {
      if (config.params.username.charAt(0) === "a") {
        return [200, true];
      } else {
        return [200, false];
      }
    }, respHeaders);
  // Mock vocabulary IRI generator
  mock
    .onGet(Constants.API_PREFIX + "/vocabularies/identifier")
    .reply(
      200,
      "http://onto.fel.cvut.cz/ontologies/termit/vocabulary/test",
      respHeaders
    );
  // Mock get vocabularies
  mock
    .onGet(Constants.API_PREFIX + "/vocabularies")
    .reply(200, require("../rest-mock/vocabularies"), respHeaders);
  // Mock vocabulary create endpoint
  mock.onPost(Constants.API_PREFIX + "/vocabularies").reply(
    201,
    null,
    Object.assign({}, respHeaders, {
      location:
        "http://kbss.felk.cvut.cz/termit/rest/vocabularies/metropolitan-plan",
    })
  );
  // mock.onPost(Constants.API_PREFIX + "/vocabularies").reply(500, {
  //     message: "Unable to create vocabulary!"
  // });
  // Mock term IRI generator
  mock
    .onGet(/\/rest\/vocabularies\/.+\/terms\/identifier/)
    .reply(
      200,
      "http://onto.fel.cvut.cz/ontologies/termit/vocabulary/test/term-one",
      respHeaders
    );
  // Mock getting subterms of a vocabulary term
  mock
    .onGet(/\/rest\/vocabularies\/.+\/terms\/.+\/subterms/)
    .reply((config) => {
      const url: string = config.url!;
      if (url.indexOf("pojem-4")) {
        return [200, require("../rest-mock/subterms"), respHeaders];
      } else {
        return [200, [], respHeaders];
      }
    });

  // Mock getting term assignments
  mock
    .onGet(/\/rest\/vocabularies\/.+\/terms\/.+\/assignments/)
    .reply((config) => {
      const iri = config.url;
      const head = Object.assign({}, respHeaders, {
        "content-type": Constants.JSON_LD_MIME_TYPE,
      });
      if (iri!.indexOf("pojem-1") !== -1 || iri!.indexOf("pojem-2") !== -1) {
        return [200, require("../rest-mock/termAssignments.json"), head];
      } else {
        return [200, [], head];
      }
    });

  // Mock term creation
  mock.onPost(/\/rest\/vocabularies\/.+\/terms/).reply(
    201,
    null,
    Object.assign({}, respHeaders, {
      location:
        "http://kbss.felk.cvut.cz/termit/rest/vocabularies/metropolitan-plan/terms/test-term",
    })
  );

  // Mock getting vocabulary terms
  mock
    .onGet(/\/rest\/vocabularies\/.+\/terms\/roots/)
    .reply(200, require("../rest-mock/terms"), respHeaders);

  // Mock term update
  mock
    .onPut(/\/rest\/vocabularies\/.+\/terms\/.+/)
    .reply(204, null, respHeaders);

  // Mock getting vocabulary term
  mock.onGet(/\/rest\/vocabularies\/.+\/terms\/.+/).reply((config) => {
    const url: string = config.url!;
    const termId = url.substring(url.lastIndexOf("/") + 1);
    const terms = require("../rest-mock/terms");
    for (const t of terms) {
      if (t["@id"].indexOf(termId) !== -1) {
        return [200, t, respHeaders];
      }
    }
    return [404, undefined, respHeaders];
  });

  // Mock term label uniqueness in vocabulary check
  mock
    .onGet(/\/rest\/vocabularies\/.+\/terms\/name/)
    .reply((config: AxiosRequestConfig) => {
      if (config.params.value === "test") {
        return [200, true];
      } else {
        return [200, false];
      }
    });

  // Mock vocabulary terms export
  mock
    .onGet(/\/rest\/vocabularies\/.+\/terms/)
    .reply((config: AxiosRequestConfig) => {
      if (config.headers!.Accept === Constants.CSV_MIME_TYPE) {
        const exportData =
          "IRI,Label,Comment,Types,Sources,SubTerms\nhttp://test.org,Test,Test comment,,,";
        const attachmentHeader = {};
        attachmentHeader[Constants.Headers.CONTENT_DISPOSITION] =
          'attachment; filename="export.csv"';
        return [
          200,
          exportData,
          Object.assign({}, respHeaders, attachmentHeader),
        ];
      }
      return [415, null];
    });

  // Mock vocabulary retrieval endpoint
  mock.onGet(/\/rest\/vocabularies\/.+/).reply(
    200,
    require("../rest-mock/vocabulary"),
    Object.assign({}, respHeaders, {
      "content-type": Constants.JSON_LD_MIME_TYPE,
    })
  );

  // Mock resource IRI generator
  mock
    .onGet(Constants.API_PREFIX + "/resources/identifier")
    .reply(
      200,
      "http://onto.fel.cvut.cz/ontologies/termit/resource/test-resource",
      respHeaders
    );

  // Mock text analysis invocation
  mock
    .onPut(/\/rest\/resources\/.+\/text-analysis/)
    .reply(204, null, respHeaders);

  // Mock getting file content
  mock.onGet(/\/rest\/resources\/.+\/content/).reply(
    200,
    fileContent,
    Object.assign({}, respHeaders, {
      "content-type": Constants.HTML_MIME_TYPE,
    })
  );

  // Mock update file content
  mock.onPut(/\/rest\/resources\/.+\/content/).reply(
    204,
    fileContent,
    Object.assign({}, respHeaders, {
      "content-type": Constants.HTML_MIME_TYPE,
    })
  );

  // Mock resource retrieval endpoint
  mock.onGet(/\/rest\/resources\/.+/).reply((config) => {
    if (
      config.params.namespace &&
      config.params.namespace.indexOf("document") !== -1
    ) {
      return [
        200,
        require("../rest-mock/document"),
        Object.assign({}, respHeaders, {
          "content-type": Constants.JSON_LD_MIME_TYPE,
        }),
      ];
    } else {
      return [
        200,
        require("../rest-mock/resource"),
        Object.assign({}, respHeaders, {
          "content-type": Constants.JSON_LD_MIME_TYPE,
        }),
      ];
    }
  });
  // Mock resource creation
  mock.onPost(Constants.API_PREFIX + "/resources").reply(
    201,
    null,
    Object.assign({}, respHeaders, {
      location:
        "http://onto.fel.cvut.cz/ontologies/application/termit/randomInstance-1529066498",
    })
  );

  // Mock resource tags update
  mock.onPut("/rest/resources/resource/terms").reply(204, null, respHeaders);

  // Mock vocabulary update endpoint
  mock.onPut(/\/rest\/vocabularies\/.+/).reply(204, undefined, respHeaders);

  mock.onGet(/\/rest\/query/).reply((config) => {
    if (config.params.query.includes("?asset")) {
      return [200, require("../rest-mock/assetCount"), respHeaders];
    } else if (config.params.query.includes("DISTINCT ?pojem")) {
      return [200, require("../rest-mock/termFrequency"), respHeaders];
    } else if (config.params.query.includes("?typ")) {
      return [200, require("../rest-mock/termTypeFrequency"), respHeaders];
    } else {
      return [200, [], respHeaders];
    }
  });

  // Mock label search results
  mock
    .onGet(Constants.API_PREFIX + "/search/label")
    .reply(200, require("../rest-mock/searchResults"), respHeaders);

  // Mock get types
  mock
    .onGet(/\/rest\/language\/types/)
    .reply(200, require("../rest-mock/types"), respHeaders);

  // Mock get label
  mock.onGet(Constants.API_PREFIX + "/data/label").reply((config) => {
    const iri: string = config.params.iri;
    if (iri.indexOf("#") !== -1) {
      return [404, undefined, respHeaders];
    }
    return [200, iri.substring(iri.lastIndexOf("/") + 1), respHeaders];
  });
  // Mock getting known properties
  mock.onGet(Constants.API_PREFIX + "/data/properties").reply(
    200,
    require("../rest-mock/properties"),
    Object.assign({}, respHeaders, {
      "content-type": Constants.JSON_LD_MIME_TYPE,
    })
  );
  // Mock creating new property
  mock.onPost(Constants.API_PREFIX + "/data/properties").reply(
    201,
    undefined,
    Object.assign({}, respHeaders, {
      location: "http://kbss.felk.cvut.cz/termit/rest/data/properties",
    })
  );
  // Mock getting last edited assets
  mock.onGet(Constants.API_PREFIX + "/assets/last-edited").reply(
    200,
    require("../rest-mock/lastEditedAssets"),
    Object.assign({}, respHeaders, {
      "content-type": Constants.JSON_LD_MIME_TYPE,
    })
  );
}

const instance = new Ajax();

export default instance;

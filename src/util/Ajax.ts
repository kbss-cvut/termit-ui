import axios, { AxiosHeaders, ResponseType } from "axios";
import Routing from "./Routing";
import Constants, { getEnv } from "./Constants";
import Routes from "./Routes";
import SecurityUtils from "./SecurityUtils";
import ConfigParam from "./ConfigParam";

class RequestConfigBuilder {
  private mContent?: any;
  private mParams?: {};
  private mFormData?: {};
  private mResponseType?: ResponseType;
  private mHeaders: {};
  private mAbortSignal?: AbortSignal;
  private preserveAcceptHeader: boolean;

  constructor() {
    this.mHeaders = {};
    this.mHeaders[Constants.Headers.CONTENT_TYPE] = Constants.JSON_LD_MIME_TYPE;
    this.mHeaders[Constants.Headers.ACCEPT] = Constants.JSON_LD_MIME_TYPE;
    this.mResponseType = undefined;
    this.mAbortSignal = undefined;
    this.preserveAcceptHeader = false;
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

  public param(
    paramName: string,
    paramValue?: string | string[]
  ): RequestConfigBuilder {
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

  public preserveAcceptHeaderInPost() {
    this.preserveAcceptHeader = true;
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
   * Whether to preserve accept header in POST requests.
   */
  public shouldPreserveAcceptHeader() {
    return this.preserveAcceptHeader;
  }

  /**
   * This should be used sparsely.
   *
   * It is mainly to support downloading binary files.
   */
  public getResponseType() {
    return this.mResponseType;
  }

  public getAbortSignal() {
    return this.mAbortSignal;
  }

  public signal(controller: AbortController) {
    this.mAbortSignal = controller.signal;
    return this;
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

export function responseType(value: ResponseType) {
  return new RequestConfigBuilder().responseType(value);
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
        reqConfig.headers = new AxiosHeaders();
      }
      reqConfig.headers.setAuthorization(SecurityUtils.loadToken());
      reqConfig.withCredentials = true;
      return reqConfig;
    });
    this.axiosInstance.interceptors.response.use(
      (resp) => {
        if (resp.headers && (resp.headers as AxiosHeaders).hasAuthorization()) {
          SecurityUtils.saveToken(
            (resp.headers as AxiosHeaders).getAuthorization() as any
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
            Object.assign(
              {
                messageId:
                  response.status === Constants.STATUS_FORBIDDEN
                    ? "auth.action.unauthorized"
                    : undefined,
              },
              response.data,
              {
                status: response.status,
              }
            )
          );
        }
      }
    );
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
      signal: config.getAbortSignal(),
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
      signal: config.getAbortSignal(),
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

  public post(
    path: string,
    config: RequestConfigBuilder = new RequestConfigBuilder()
  ) {
    const conf = {
      headers: config.getHeaders(),
      signal: config.getAbortSignal(),
      paramsSerializer,
    };
    if (!config.shouldPreserveAcceptHeader()) {
      delete conf.headers[Constants.Headers.ACCEPT];
    }
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
      signal: config.getAbortSignal(),
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
        signal: config.getAbortSignal(),
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

const instance = new Ajax();

export default instance;

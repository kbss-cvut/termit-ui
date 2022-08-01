/**
 * General utility functions.
 */
import Asset, { HasLabel, HasTypes } from "../model/Asset";
import VocabularyUtils, { IRI, IRIImpl } from "./VocabularyUtils";
import { match } from "react-router";
import { Location } from "history";
import AppNotification, {
  AssetUpdateNotification,
} from "../model/AppNotification";
import NotificationType from "../model/NotificationType";
import { BasicRouteProps } from "./Types";
import _ from "lodash";
import { Configuration } from "../model/Configuration";

const Utils = {
  /**
   * Ensures that the specified argument is returned as an array at all conditions.
   *
   * If the argument is a single element, it is returned as a single-element array.
   * @param arr Input to sanitize
   */
  sanitizeArray<T>(arr: T[] | T | undefined | null): T[] {
    return arr ? (Array.isArray(arr) ? arr : [arr]) : [];
  },

  /**
   * Checks if the specified string is a link which can be dereferenced.
   * @param str
   */
  isLink(str: string): boolean {
    return (
      str.startsWith("http://") ||
      str.startsWith("https://") ||
      str.startsWith("ftp://") ||
      str.startsWith("sftp://")
    );
  },

  /**
   * Extracts query parameter value from the specified query string.
   *
   * Note that if multiple values of the parameter are present, this method returns only the first one.
   * @param queryString String to extracts params from
   * @param paramName Name of the parameter to extract
   * @return extracted parameter value or undefined if the parameter is not present in the query
   */
  extractQueryParam(
    queryString: string,
    paramName: string
  ): string | undefined {
    const result = Utils.extractQueryParams(queryString, paramName);
    return result.length > 0 ? result[0] : undefined;
  },

  /**
   * Extract query parameter values from the specified query string
   * @param queryString String to extracts params from
   * @param paramName Name of the parameter to extract
   * @return an array containing extracted parameter values, empty array if the parameter is not found the query string
   */
  extractQueryParams(queryString: string, paramName: string): string[] {
    queryString = decodeURI(queryString); // TODO This is a nasty hack, the problem with encoding seems to be
    // // somewhere in thunk
    const params = new Proxy(new URLSearchParams(queryString), {
      get: (searchParams, prop) => searchParams.getAll(prop.toString()),
    });
    return params[paramName];
  },

  /**
   * Extracts asset IRI from the specified route props.
   *
   * Uses match param {@code name} as fragment value. Namespace is extracted from location search string.
   */
  extractAssetIri(routeMatch: match<any>, location: Location) {
    const namespace = this.extractQueryParam(location.search, "namespace");
    const normalizedName = routeMatch.params.name;
    return { fragment: normalizedName, namespace };
  },

  /**
   * Ensures that file download using Ajax triggers browser file save mechanism.
   *
   * Adapted from https://github.com/kennethjiang/js-file-download/blob/master/file-download.js
   * @param data The downloaded data
   * @param filename Name of the file
   * @param mimeType Type of data
   */
  fileDownload(
    data: any,
    filename: string,
    mimeType: string = "application/octet-stream"
  ) {
    const blob = new Blob([data], { type: mimeType });
    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.style.display = "none";
    tempLink.href = blobURL;
    tempLink.setAttribute("download", filename);

    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    window.URL.revokeObjectURL(blobURL);
  },

  /**
   * Creates paging parameters (page number - starts at 0, page size) from the specified offset and limit
   * configuration.
   *
   * Note that offset is always rounded up to the the closest greater page number. I.e., for example, offset 88 with
   * limit 100 results in page = 1 and size = 100.
   *
   * This allows to adapt offset and limit-based components (e.g., the intelligent-tree-select) to paging-based
   * server API.
   * @param offset Result offset
   * @param limit Number of results
   */
  createPagingParams(
    offset?: number,
    limit?: number
  ): { page?: number; size?: number } {
    if (
      offset === undefined ||
      !Number.isInteger(offset) ||
      limit === undefined ||
      !Number.isInteger(limit)
    ) {
      return {};
    }
    return {
      size: limit,
      page: Math.ceil(offset / limit),
    };
  },

  /**
   * Determines primary asset type from the specified data.
   *
   * Primary asset type is the most specific ontological class the specified asset data carry. For instance, for a
   * resource of type file, which would contain both file and resource in its "types" definition, file is the primary
   * one, as it is more specific than resource.
   *
   * The type is determined using the "types" attribute.
   * @param asset Asset whose type should be determined
   * @return asset primary  type, undefined if the type is not known or it the asset does not contain type info
   */
  getPrimaryAssetType(asset: HasTypes): string | undefined {
    const types = this.sanitizeArray((asset || {}).types);
    if (types.indexOf(VocabularyUtils.TERM) !== -1) {
      return VocabularyUtils.TERM;
    } else if (types.indexOf(VocabularyUtils.VOCABULARY) !== -1) {
      return VocabularyUtils.VOCABULARY;
    } else if (types.indexOf(VocabularyUtils.DOCUMENT) !== -1) {
      return VocabularyUtils.DOCUMENT;
    } else if (types.indexOf(VocabularyUtils.FILE) !== -1) {
      return VocabularyUtils.FILE;
    } else if (types.indexOf(VocabularyUtils.RESOURCE) !== -1) {
      return VocabularyUtils.RESOURCE;
    } else {
      return undefined;
    }
  },

  /**
   * Determines the id of the i18n message representing the label of the specified asset's type.
   *
   * The type resolution is based on value of the @type attribute of the specified asset.
   * @param asset Asset whose type label id should be determined
   */
  getAssetTypeLabelId(asset: HasTypes): string | undefined {
    switch (this.getPrimaryAssetType(asset)) {
      case VocabularyUtils.TERM:
        return "type.term";
      case VocabularyUtils.VOCABULARY:
        return "type.vocabulary";
      case VocabularyUtils.DOCUMENT:
        return "type.document";
      case VocabularyUtils.FILE:
        return "type.file";
      case VocabularyUtils.RESOURCE:
        return "type.resource";
      default:
        return undefined;
    }
  },

  /**
   * Calculates the height of the asset tree selector.
   */
  calculateAssetListHeight() {
    return window.innerHeight >= 950
      ? window.innerHeight * 0.66
      : window.innerHeight / 2;
  },

  /**
   * Compares the specified asset data by their label.
   *
   * Internally uses String.localeCompare
   * @param a Reference asset
   * @param b Asset to compare it to
   */
  labelComparator<T extends HasLabel>(a: T, b: T) {
    return a.getLabel().localeCompare(b.getLabel());
  },

  localeComparator(a: string, b: string) {
    return a.localeCompare(b);
  },

  /**
   * Value renderer for the intelligent tree select component.
   *
   * This renderer takes the specified option and renders its label.
   * @param option Options to render
   */
  labelValueRenderer(option: { label: string }) {
    return option.label;
  },

  /**
   * Calculates a hash of the specified string.
   * @param str String to get hash for
   */
  hashCode(str: string) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h;
  },

  isDesktopView() {
    return window.innerWidth >= 768;
  },

  /**
   * Returns a function which checks whether a notification is an update of the specified asset type which changed
   * the asset's label.
   * @param assetType Asset type IRI
   */
  generateIsAssetLabelUpdate(assetType: string) {
    return (n: AppNotification) => {
      if (n.source.type !== NotificationType.ASSET_UPDATED) {
        return false;
      }
      const aun: AssetUpdateNotification<Asset> =
        n as AssetUpdateNotification<Asset>;
      return (
        aun.updated.hasType(assetType) &&
        aun.original != null &&
        aun.updated.getLabel() !== aun.original.getLabel()
      );
    };
  },

  didNavigationOccur(
    prevProps: Readonly<BasicRouteProps>,
    currentProps: Readonly<BasicRouteProps>
  ) {
    const prevNamespace = this.extractQueryParam(
      prevProps.location.search,
      "namespace"
    );
    const namespace = this.extractQueryParam(
      currentProps.location.search,
      "namespace"
    );
    if (prevNamespace !== namespace) {
      return true;
    }
    const prevParams = Object.getOwnPropertyNames(prevProps.match.params);
    const currentParams = Object.getOwnPropertyNames(currentProps.match.params);
    if (!_.isEqual(prevParams.sort(), currentParams.sort())) {
      return true;
    }
    for (const p of prevParams) {
      if (prevProps.match.params[p] !== currentProps.match.params[p]) {
        return true;
      }
    }
    return false;
  },

  resolveVocabularyIriFromRoute(
    params: { name: string; timestamp?: string },
    location: string,
    configuration: Configuration
  ): IRI {
    let normalizedName = params.name;
    const timestamp = params.timestamp;
    let namespace = this.extractQueryParam(location, "namespace");
    if (timestamp) {
      namespace += normalizedName + configuration.versionSeparator + "/";
      normalizedName = timestamp;
    }
    return IRIImpl.create({ fragment: normalizedName, namespace });
  },
};

export default Utils;

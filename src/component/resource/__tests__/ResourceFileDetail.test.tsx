import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import { TextAnalysisRecord } from "../../../model/TextAnalysisRecord";
import { createMemoryHistory, Location } from "history";
import { match as Match, RouteComponentProps } from "react-router";
import { shallow } from "enzyme";
import { ResourceFileDetail } from "../ResourceFileDetail";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import File from "../../../model/File";
import Generator from "../../../__tests__/environment/Generator";
import Resource, { EMPTY_RESOURCE } from "../../../model/Resource";
import FileDetail from "../../file/FileContentDetail";
import Routes from "../../../util/Routes";
import VocabularySelect from "../../vocabulary/VocabularySelect";

describe("ResourceFileDetail", () => {
  const resourceName = "test-resource";
  const resourceNamespace = VocabularyUtils.FILE + "/";

  let loadResource: (resourceIri: IRI) => void;
  let loadLatestTextAnalysisRecord: (
    resourceIri: IRI
  ) => Promise<TextAnalysisRecord | null>;
  let popRoutingPayload: () => void;

  let location: Location;
  const history = createMemoryHistory();
  let match: Match<any>;
  let routeProps: RouteComponentProps<any>;

  let resource: File;

  beforeEach(() => {
    loadResource = jest.fn();
    loadLatestTextAnalysisRecord = jest
      .fn()
      .mockImplementation(() => Promise.resolve(null));
    popRoutingPayload = jest.fn();

    location = {
      pathname: "/resource/" + resourceName + "/annotate/",
      search: "?fileNamespace=" + resourceNamespace,
      hash: "",
      state: {},
    };
    match = {
      params: {
        fileName: resourceName,
      },
      path: location.pathname,
      isExact: true,
      url: "http://localhost:3000/" + location.pathname + location.search,
    };
    routeProps = { location, history, match };
    resource = new File({
      iri: resourceNamespace + resourceName,
      label: "Test resource",
      types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
    });
  });

  it("loads resource on mount", () => {
    shallow(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    expect(loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(resourceNamespace + resourceName)
    );
  });

  it("retrieves vocabulary IRI from provided resource when it belongs to a document related to a vocabulary", () => {
    const vocabularyIri = Generator.generateUri();
    resource.owner = {
      iri: Generator.generateUri(),
      label: "Test document",
      vocabulary: { iri: vocabularyIri },
      files: [resource],
    };
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    const fileDetail = wrapper.find(FileDetail);
    expect(fileDetail.exists()).toBeTruthy();
    expect(fileDetail.prop("vocabularyIri")).toEqual(
      VocabularyUtils.create(vocabularyIri)
    );
    expect(loadLatestTextAnalysisRecord).not.toHaveBeenCalled();
  });

  it("retrieves vocabulary IRI from resource when it belongs to a document related to a vocabulary on update", () => {
    const vocabularyIri = Generator.generateUri();
    resource.owner = {
      iri: Generator.generateUri(),
      label: "Test document",
      vocabulary: { iri: vocabularyIri },
      files: [resource],
    };
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={EMPTY_RESOURCE}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    wrapper.setProps({ resource });
    wrapper.update();
    const fileDetail = wrapper.find(FileDetail);
    expect(fileDetail.exists()).toBeTruthy();
    expect(fileDetail.prop("vocabularyIri")).toEqual(
      VocabularyUtils.create(vocabularyIri)
    );
  });

  it("retrieves latest text analysis record for a standalone file on mount", () => {
    const vocabularyIri = Generator.generateUri();
    const record = new TextAnalysisRecord({
      iri: Generator.generateUri(),
      analyzedResource: resource,
      created: Date.now(),
      vocabularies: [{ iri: vocabularyIri }],
    });
    (loadLatestTextAnalysisRecord as jest.Mock).mockImplementation(() =>
      Promise.resolve(record)
    );
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    return Promise.resolve().then(() => {
      expect(loadLatestTextAnalysisRecord).toHaveBeenCalledWith(
        VocabularyUtils.create(resourceNamespace + resourceName)
      );
      const fileDetail = wrapper.find(FileDetail);
      expect(fileDetail.exists()).toBeTruthy();
      expect(fileDetail.prop("vocabularyIri")).toEqual(
        VocabularyUtils.create(vocabularyIri)
      );
    });
  });

  it("retrieves latest text analysis record for a standalone file", () => {
    const vocabularyIri = Generator.generateUri();
    const record = new TextAnalysisRecord({
      iri: Generator.generateUri(),
      analyzedResource: resource,
      created: Date.now(),
      vocabularies: [{ iri: vocabularyIri }],
    });
    (loadLatestTextAnalysisRecord as jest.Mock).mockImplementation(() =>
      Promise.resolve(record)
    );
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={EMPTY_RESOURCE}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    wrapper.setProps({ resource });
    wrapper.update();
    return Promise.resolve().then(() => {
      expect(loadLatestTextAnalysisRecord).toHaveBeenCalledWith(
        VocabularyUtils.create(resourceNamespace + resourceName)
      );
      const fileDetail = wrapper.find(FileDetail);
      expect(fileDetail.exists()).toBeTruthy();
      expect(fileDetail.prop("vocabularyIri")).toEqual(
        VocabularyUtils.create(vocabularyIri)
      );
    });
  });

  it("renders vocabulary selector when no text analysis record exists for a standalone file", () => {
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={EMPTY_RESOURCE}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    wrapper.setProps({ resource });
    wrapper.update();
    return Promise.resolve().then(() => {
      expect(loadLatestTextAnalysisRecord).toHaveBeenCalledWith(
        VocabularyUtils.create(resourceNamespace + resourceName)
      );
      expect(wrapper.find(FileDetail).exists()).toBeFalsy();
      expect(wrapper.exists(VocabularySelect)).toBeTruthy();
    });
  });

  it("rechecks for Vocabulary IRI when new File is provided", () => {
    const vocabularyIri = Generator.generateUri();
    resource.owner = {
      iri: Generator.generateUri(),
      label: "Test document",
      vocabulary: { iri: vocabularyIri },
      files: [resource],
    };
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    const anotherFile = new File({
      iri: Generator.generateUri(),
      label: resourceName,
      owner: {
        iri: Generator.generateUri(),
        label: "Test document two",
        vocabulary: { iri: Generator.generateUri() },
        files: [],
      },
      types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
    });
    wrapper.setProps({ resource: anotherFile });
    wrapper.update();
    const fileDetail = wrapper.find(FileDetail);
    expect(fileDetail.prop("vocabularyIri")).toEqual(
      VocabularyUtils.create(anotherFile.owner!.vocabulary!.iri!)
    );
  });

  it("does not attempt to load text analysis record when current resource is empty", () => {
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    jest.resetAllMocks();
    wrapper.setProps({ resource: EMPTY_RESOURCE });
    wrapper.update();
    expect(loadLatestTextAnalysisRecord).not.toHaveBeenCalled();
  });

  it("does not attempt to load text analysis record when current resource is not file", () => {
    const res = new Resource({
      iri: Generator.generateUri(),
      label: "test resource",
      types: [VocabularyUtils.RESOURCE],
    });
    shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={res}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    expect(loadLatestTextAnalysisRecord).not.toHaveBeenCalled();
  });

  it("extracts selector of annotation to highlight from route transition payload", () => {
    const payload = {
      selector: {
        iri: Generator.generateUri(),
        exactMatch: "test-term",
        types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
      },
    };
    const payloadCache = {};
    payloadCache[Routes.annotateFile.name] = payload;
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={payloadCache}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    expect(wrapper.state().scrollToSelector).toEqual(payload.selector);
  });

  it("clears route transition payload for file annotation route after mount", () => {
    shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    expect(popRoutingPayload).toHaveBeenCalled();
  });

  it("reloads resource when filename in URL changes", () => {
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    const newResourceName = "different-resource";
    const newMatch = Object.assign({}, match, {
      url: "http://localhost:3000/" + location.pathname + location.search,
      params: { fileName: newResourceName },
    });
    wrapper.setProps({ match: newMatch });
    wrapper.update();
    expect(loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(resourceNamespace + newResourceName)
    );
  });

  it("reloads resource when namespace in URL changes", () => {
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    const newNamespace = `${Generator.generateUri()}/`;
    const newLocation = Object.assign({}, location, {
      search: `?fileNamespace=${newNamespace}`,
    });
    const newMatch = Object.assign({}, match, {
      url: "http://localhost:3000/" + newLocation.pathname + newLocation.search,
    });
    wrapper.setProps({ match: newMatch, location: newLocation });
    wrapper.update();
    expect(loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(newNamespace + resourceName)
    );
  });

  it("sets vocabulary in state to undefined to force its reload when namespace in URL changes", () => {
    resource.owner = {
      vocabulary: { iri: Generator.generateUri() },
      iri: Generator.generateUri(),
      label: "Test document",
      files: [resource],
    };
    const wrapper = shallow<ResourceFileDetail>(
      <ResourceFileDetail
        resource={resource}
        routeTransitionPayload={{}}
        loadResource={loadResource}
        popRoutingPayload={popRoutingPayload}
        loadLatestTextAnalysisRecord={loadLatestTextAnalysisRecord}
        {...routeProps}
        {...intlFunctions()}
      />
    );
    expect(wrapper.state().vocabularyIri).toBeDefined();
    const newResourceName = "different-resource";
    const newMatch = Object.assign({}, match, {
      url: "http://localhost:3000/" + location.pathname + location.search,
      params: { name: newResourceName },
    });
    wrapper.setProps({ match: newMatch });
    wrapper.update();
    expect(wrapper.state().vocabularyIri).not.toBeDefined();
  });
});

import * as React from "react";
import AppNotification from "../../../model/AppNotification";
import { ResourceList } from "../ResourceList";
import NotificationType from "../../../model/NotificationType";
import Generator from "../../../__tests__/environment/Generator";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { act } from "react-dom/test-utils";
import {
  flushPromises,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import Document from "../../../model/Document";
import VocabularyUtils from "../../../util/VocabularyUtils";
import ResourceLink from "../ResourceLink";
import { ReactWrapper } from "enzyme";
import { MemoryRouter } from "react-router-dom";

describe("ResourceList", () => {
  let loadResources: () => void;
  let consumeNotification: (n: AppNotification) => void;

  beforeEach(() => {
    loadResources = jest.fn();
    consumeNotification = jest.fn();
  });

  it("loads resources on mount", async () => {
    mountWithIntl(
      <ResourceList
        resources={{}}
        notifications={[]}
        loadResources={loadResources}
        consumeNotification={consumeNotification}
        {...intlFunctions()}
      />
    );
    await act(async () => {
      await flushPromises();
    });
    expect(loadResources).toHaveBeenCalled();
  });

  it("reloads resources when asset label update notification is published", () => {
    const wrapper = mountWithIntl(
      <ResourceList
        resources={{}}
        notifications={[]}
        loadResources={loadResources}
        consumeNotification={consumeNotification}
        {...intlFunctions()}
      />
    );
    (loadResources as jest.Mock).mockClear();
    const notification = {
      source: { type: NotificationType.ASSET_UPDATED },
      original: Generator.generateResource(),
      updated: Generator.generateResource(),
    };
    wrapper.setProps({ notifications: [notification] });
    wrapper.update();
    expect(loadResources).toHaveBeenCalled();
  });

  it("displays only resource when type filter is set to Resource", () => {
    const resources = [
      Generator.generateResource(),
      Generator.generateResource(),
    ];
    const documents = [
      new Document({
        iri: Generator.generateUri(),
        label: "Document",
        files: [],
        types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE],
      }),
    ];
    const allResources = {};
    resources.forEach((r) => (allResources[r.iri] = r));
    documents.forEach((d) => (allResources[d.iri] = d));
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <ResourceList
          resources={allResources}
          notifications={[]}
          loadResources={loadResources}
          consumeNotification={consumeNotification}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const rowsBeforeFilter = wrapper.find(ResourceLink);
    expect(rowsBeforeFilter.length).toEqual(
      resources.length + documents.length
    );
    const typeSelect = wrapper.find("select.m-table-select-filter");
    (typeSelect.getDOMNode() as HTMLSelectElement).value =
      VocabularyUtils.RESOURCE;
    typeSelect.simulate("change", typeSelect);
    wrapper.update();
    const rowsAfterFilter = wrapper.find(ResourceLink);
    expect(rowsAfterFilter.length).toEqual(resources.length);
    resources.forEach((r) =>
      expect(
        rowsAfterFilter.filter(
          (w: ReactWrapper) => w.text().indexOf(r.label) !== -1
        )
      ).toBeDefined()
    );
  });
});

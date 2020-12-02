import * as React from "react";
import AppNotification from "../../../model/AppNotification";
import {ResourceList} from "../ResourceList";
import NotificationType from "../../../model/NotificationType";
import Generator from "../../../__tests__/environment/Generator";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {act} from "react-dom/test-utils";
import {flushPromises, mountWithIntl} from "../../../__tests__/environment/Environment";

describe("ResourceList", () => {

    let loadResources: () => void;
    let consumeNotification: (n: AppNotification) => void;

    beforeEach(() => {
        loadResources = jest.fn();
        consumeNotification = jest.fn();
    });

    it("loads resources on mount", async () => {
        mountWithIntl(<ResourceList resources={{}} notifications={[]}
                                            loadResources={loadResources}
                                            consumeNotification={consumeNotification} {...intlFunctions()}/>);
        await act(async () => {
            await flushPromises();
        });
        expect(loadResources).toHaveBeenCalled();
    });

    it("reloads resources when asset label update notification is published", () => {
        const wrapper = mountWithIntl(<ResourceList resources={{}} notifications={[]}
                                                            loadResources={loadResources}
                                                            consumeNotification={consumeNotification} {...intlFunctions()}/>);
        (loadResources as jest.Mock).mockClear();
        const notification = {
            source: {type: NotificationType.ASSET_UPDATED},
            original: Generator.generateResource(),
            updated: Generator.generateResource()
        };
        wrapper.setProps({notifications: [notification]});
        wrapper.update();
        expect(loadResources).toHaveBeenCalled();
    });
});

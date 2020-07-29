import * as React from "react";
import AppNotification from "../../../model/AppNotification";
import {shallow} from "enzyme";
import {ResourceList} from "../ResourceList";
import NotificationType from "../../../model/NotificationType";
import Generator from "../../../__tests__/environment/Generator";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";

describe("ResourceList", () => {

    let loadResources: () => void;
    let consumeNotification: (n: AppNotification) => void;

    beforeEach(() => {
        loadResources = jest.fn();
        consumeNotification = jest.fn();
    });

    it("loads resources on mount", () => {
        shallow<ResourceList>(<ResourceList resources={{}} notifications={[]}
                                            loading={false}
                                            loadResources={loadResources}
                                            consumeNotification={consumeNotification} {...intlFunctions()}/>);
        expect(loadResources).toHaveBeenCalled();
    });

    it("reloads resources when asset label update notification is published", () => {
        const wrapper = shallow<ResourceList>(<ResourceList resources={{}} notifications={[]}
                                                            loading={false}
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

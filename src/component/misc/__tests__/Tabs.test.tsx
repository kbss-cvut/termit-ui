import * as React from 'react';
import {ReactElement} from 'react';
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {Tabs} from "../Tabs";

const Component:React.SFC = () => <div>Test</div>;

describe('Tabs Test', () => {
    let change : () => void;
    let tabs : ReactElement<any>;

    beforeEach(() => {
        change = jest.fn();
        tabs = <Tabs
            activeTabLabelKey='edit'
            tabs={ {'edit' : <Component/>, 'save' : <Component/> }}
            changeTab={change} {...intlFunctions()}
        />
    });

    it('Tab container contains correct number of tabs', () => {
        const wrapper = mountWithIntl(tabs);
        expect(wrapper.find('NavLink').length).toEqual(2);
    });

    it('Change action called upon non-active tab clicked', () => {
        const wrapper = mountWithIntl(tabs);
        wrapper.find('NavLink').at(1).simulate('click');
        expect(change).toHaveBeenCalled();
    });

    it('Change action not called upon active tab clicked', () => {
        const wrapper = mountWithIntl(tabs);
        wrapper.find('NavLink').at(0).simulate('click');
        expect(change).not.toHaveBeenCalled();
    });
});
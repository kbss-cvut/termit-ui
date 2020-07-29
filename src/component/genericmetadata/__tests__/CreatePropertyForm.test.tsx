import * as React from "react";
import {RdfsResourceData} from "../../../model/RdfsResource";
import {shallow} from "enzyme";
import {CreatePropertyForm} from "../CreatePropertyForm";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("CreatePropertyForm", () => {

    let onCreate: (data: RdfsResourceData) => void;
    let toggleModal: () => void;

    beforeEach(() => {
        onCreate = jest.fn();
        toggleModal = jest.fn();
    });

    it("adds rdf:Property to types on create", () => {
        const wrapper = shallow(<CreatePropertyForm onOptionCreate={onCreate}
                                                    toggleModal={toggleModal} {...intlFunctions()}/>);
        wrapper.instance().setState({iri: Generator.generateUri(), label: "test"});
        (wrapper.instance() as CreatePropertyForm).onCreate();
        expect(onCreate).toHaveBeenCalled();
        const data: RdfsResourceData = (onCreate as jest.Mock).mock.calls[0][0];
        expect(data.types).toBeDefined();
        expect(data.types!.indexOf(VocabularyUtils.RDF_PROPERTY)).not.toEqual(-1);
    });
});

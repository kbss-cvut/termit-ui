import * as React from "react";
import {default as Vocabulary, EMPTY_VOCABULARY} from "../../../model/Vocabulary";
import {VocabularySelect} from "../VocabularySelect";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {DropdownItem, DropdownToggle} from "reactstrap";

describe("VocabularySelect", () => {

    let voc: Vocabulary;
    let onVocabularySet: (voc: Vocabulary) => void;
    let loadVocabularies: () => void;
    let vocabularies: { [key: string]: Vocabulary };


    beforeEach(() => {
        onVocabularySet = jest.fn();
        loadVocabularies = jest.fn();
        voc = EMPTY_VOCABULARY;
        vocabularies = {};
        vocabularies[EMPTY_VOCABULARY.iri] = EMPTY_VOCABULARY;
    });

    it("VocabularySelect Selection calls the callback", () => {
        const wrapper = mountWithIntl(<VocabularySelect
            vocabulary={voc}
            onVocabularySet={onVocabularySet}
            vocabularies={vocabularies}
            loadVocabularies={loadVocabularies}
            {...intlFunctions()}
        />);
        wrapper.find(DropdownToggle).simulate("click");
        wrapper.find(DropdownItem).simulate("click");
        expect(onVocabularySet).toHaveBeenCalled();
    });
});


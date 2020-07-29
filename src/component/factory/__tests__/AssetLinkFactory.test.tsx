import * as React from "react";
import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import AssetLinkFactory from "../AssetLinkFactory";
import {TermLink} from "../../term/TermLink";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {MemoryRouter} from "react-router";
import Vocabulary from "../../../model/Vocabulary";
import Document from "../../../model/Document";
import File from "../../../model/File";
import VocabularyLink from "../../vocabulary/VocabularyLink";
import ResourceLink from "../../resource/ResourceLink";
import Resource from "../../../model/Resource";
import Generator from "../../../__tests__/environment/Generator";
import {Link} from "react-router-dom";
import {Label} from "reactstrap";

describe("AssetLinkFactory", () => {
    describe("createAssetLink", () => {
        it("creates TermLink for Term", () => {
            const termName = "test-one";
            const vocabularyName = "metropolitan-plan";
            const vocabularyNamespace = VocabularyUtils.PREFIX;
            const term: Term = new Term({
                iri: vocabularyNamespace + vocabularyName + "/terms/" + termName,
                label: "Test one",
                vocabulary: {
                    iri: vocabularyNamespace + vocabularyName,
                    label: "Vocabulary"
                },
                types: [VocabularyUtils.TERM]
            });
            const result = mountWithIntl(<MemoryRouter>{AssetLinkFactory.createAssetLink(term)}</MemoryRouter>);
            expect(result.find(TermLink).exists()).toBeTruthy();
        });

        it("creates VocabularyLink for Vocabulary", () => {
            const name = "metropolitan-plan";
            const vocabularyNamespace = VocabularyUtils.PREFIX;
            const vocabulary = new Vocabulary({
                iri: vocabularyNamespace + name,
                label: "Vocabulary",
                types: [VocabularyUtils.VOCABULARY]
            });
            const result = mountWithIntl(<MemoryRouter>{AssetLinkFactory.createAssetLink(vocabulary)}</MemoryRouter>);
            expect(result.find(VocabularyLink).exists()).toBeTruthy();
        });

        it("creates ResourceLink for Document", () => {
            const name = "mpp-3.3";
            const namespace = VocabularyUtils.PREFIX;
            const document = new Document({
                iri: namespace + name,
                label: "Document",
                files: [],
                types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE]
            });
            const result = mountWithIntl(<MemoryRouter>{AssetLinkFactory.createAssetLink(document)}</MemoryRouter>);
            expect(result.find(ResourceLink).exists()).toBeTruthy();
        });

        it("creates ResourceLink for File", () => {
            const name = "mpp-3.3.html";
            const namespace = VocabularyUtils.PREFIX;
            const file = new File({
                iri: namespace + name,
                label: "File",
                types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE]
            });
            const result = mountWithIntl(<MemoryRouter>{AssetLinkFactory.createAssetLink(file)}</MemoryRouter>);
            expect(result.find(ResourceLink).exists()).toBeTruthy();
        });

        it("creates ResourceLink for Resource", () => {
            const name = "mpp-3.3.html";
            const namespace = VocabularyUtils.PREFIX;
            const resource = new Resource({
                iri: namespace + name,
                label: "Resource",
                types: [VocabularyUtils.RESOURCE]
            });
            const result = mountWithIntl(<MemoryRouter>{AssetLinkFactory.createAssetLink(resource)}</MemoryRouter>);
            expect(result.find(ResourceLink).exists()).toBeTruthy();
        });

        it("creates a plain label when link cannot be created", () => {
            const resource = new Resource({
                iri: Generator.generateUri(),
                label: "Dataset",
            });
            resource.types = undefined;
            const result = mountWithIntl(<MemoryRouter>{AssetLinkFactory.createAssetLink(resource)}</MemoryRouter>);
            expect(result.find(Link).exists()).toBeFalsy();
            expect(result.find(Label).exists()).toBeTruthy();
        });
    });
});
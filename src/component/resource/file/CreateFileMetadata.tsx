import * as React from "react";
import {injectIntl} from "react-intl";
import {
    CreateResourceMetadata,
    CreateResourceMetadataProps,
    CreateResourceMetadataState
} from "../CreateResourceMetadata";
import VocabularyUtils from "../../../util/VocabularyUtils";
import withI18n from "../../hoc/withI18n";
import {Form} from "reactstrap";
import UploadFile from "./UploadFile";
import TermItFile from "../../../model/File";
import Resource from "../../../model/Resource";

interface CreateFileMetadataProps extends CreateResourceMetadataProps {
    onCreate: (termItFile : Resource, file: File) => any;
}

interface CreateFileMetadataState extends CreateResourceMetadataState {
    file?: File;
    dragActive: boolean;
}

export class CreateFileMetadata extends CreateResourceMetadata<CreateFileMetadataProps, CreateFileMetadataState> {

    constructor(props: CreateFileMetadataProps) {
        super(props);
        this.state = {
            iri: "",
            label: "",
            description: "",
            types: VocabularyUtils.RESOURCE,
            generateIri: true,
            file: undefined,
            dragActive: false
        }
    }

    public onCreate = () => {
        const {generateIri, file, dragActive, ...data} = this.state;
        if ( file ) {
            this.props.onCreate(new TermItFile(data), file);
        }
    };

    public setFile(file: File): void {
        this.setState({file, label: file.name, dragActive: false});
        this.generateIri(file.name);
    }

    public render() {
        const setFile = this.setFile.bind(this);
        return <Form>
            <UploadFile setFile={setFile}/>
            {this.renderBasicMetadataInputs()}
            {this.renderSubmitButtons()}
        </Form>;
    }
}

export default injectIntl(withI18n(CreateFileMetadata));

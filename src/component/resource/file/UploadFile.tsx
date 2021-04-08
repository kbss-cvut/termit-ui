import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {Col, Label, Row} from "reactstrap";
import Resource from "../../../model/Resource";
import Dropzone from "react-dropzone";
import {GoCloudUpload} from "react-icons/go";
import classNames from "classnames";

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
        return "0B";
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

interface UploadFileProps extends HasI18n {
    resource?: Resource | undefined;
    setFile: (file: File) => void;
}

interface UploadFileState {
    file?: File;
    dragActive: boolean;
}

export class UploadFile extends React.Component<UploadFileProps, UploadFileState> {
    constructor(props: UploadFileProps) {
        super(props);
        this.state = {
            file: undefined,
            dragActive: false
        };
    }

    public onFileSelected = (files: File[]) => {
        // There should be exactly one file
        const file = files[0];
        this.setState({file, dragActive: false});
        if (this.state.file) {
            this.props.setFile(this.state.file);
        }
    };

    private onDragEnter = () => {
        this.setState({dragActive: true});
    };

    private onDragLeave = () => {
        this.setState({dragActive: false});
    };

    public render() {
        const containerClasses = classNames("form-group", "create-resource-dropzone", {active: this.state.dragActive});
        return (
            <Row>
                <Col xs={12}>
                    <Dropzone
                        onDrop={this.onFileSelected}
                        onDragEnter={this.onDragEnter}
                        onDragLeave={this.onDragLeave}
                        multiple={false}>
                        {({getRootProps, getInputProps}) => (
                            <div {...getRootProps()} className={containerClasses}>
                                <input {...getInputProps()} />
                                <div>
                                    <Label className="placeholder-text w-100 text-center">
                                        {this.props.i18n("resource.create.file.select.label")}
                                    </Label>
                                </div>
                                <div className="w-100 icon-container text-center">
                                    <GoCloudUpload />
                                </div>
                                {this.state.file && (
                                    <div className="w-100 text-center">
                                        <Label>
                                            {this.state.file.name + " - " + formatBytes(this.state.file.size)}
                                        </Label>
                                    </div>
                                )}
                            </div>
                        )}
                    </Dropzone>
                </Col>
            </Row>
        );
    }
}

export default injectIntl(withI18n(UploadFile));

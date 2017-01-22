import React                from 'react';

import Button               from 'elemental/lib/components/Button';
import Glyph                from 'elemental/lib/components/Glyph';
import Form                 from 'elemental/lib/components/Form';
import FormField            from 'elemental/lib/components/FormField';
import FormInput            from 'elemental/lib/components/FormInput';
import FormRow              from 'elemental/lib/components/FormRow';
import Radio                from 'elemental/lib/components/Radio';
// import FileUpload from 'elemental/lib/components/FileUpload';

// may be move to https://github.com/bvaughn/react-virtualized-select/
import Select               from 'react-select';
import CreateImageDialog   from '../create-image-dialog';

import {autobind}           from 'core-decorators';

import resources            from '../../../resources';
import modalDialogDecorator from '../../../utils/modal-dialog-decorator';

const createImageModal = {};

@modalDialogDecorator({modal: createImageModal, component: CreateImageDialog})
class ImageLibrary extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            createImageDialogVisible: false,
            selectOptions: null,
            selectOptionsLoadedOnce: false,
            selectLoading: false,
            removing: false,
            error: null
        };

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    selectOptionRenderer(option) {
        return <div>
            <img className="select-image-preview" src={option.url}/>
            <span className="select-image-original-name">{option.metadata.originalName}</span>
        </div>;
    }

    selectValueRenderer(option) {
        return <div>
            <span className="select-image-original-name">{option.metadata.originalName}</span>
        </div>;
    }

    render() {
        let rootClassName = this.props.className + ' jb-image-library';
        let imageDisplayMeta;

        if (this.props.value) {
            let dt, dtFormatted;
            try {
                dt = new Date(this.props.value.uploadDate);
                dtFormatted = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
            }
            catch (err) {
            }

            imageDisplayMeta = [
                `length: ${this.props.value.length} bytes`,
                `date: ${dtFormatted || this.props.value.uploadDate}`
            ].join('\n');
        }

        return <div className={rootClassName}>
            <div className="jb-image-library__row">
                <div className="jb-image-library__select-ct">
                    <Select
                        autoload={false}
                        options={this.state.selectOptions}
                        searchable={false}
                        onOpen={this.onSelectOpen}
                        isLoading={this.selectLoading}
                        valueRenderer={this.selectValueRenderer}
                        optionRenderer={this.selectOptionRenderer}
                        value={this.props.value}
                        onChange={this.props.onChange}
                    />
                </div>
                <div className="jb-image-library__add-button-ct">
                    <Button type="primary" onClick={this.onAddImageClick}>
                        <Glyph icon="file-add"/>
                        <span>Add to library</span>
                    </Button>
                </div>
            </div>
            <div className="jb-image-library__row">
                <div className="jb-image-library__preview-ct">
                    {this.props.value ? <img className="jb-image-library__preview" src={this.props.value.url}/> : null}
                </div>
                <div className="jb-image-library__meta-ct">
                    <pre>
                        {this.props.value ? imageDisplayMeta : null}
                    </pre>
                    {this.props.value ?
                        <Button
                            type="link-cancel"
                            onClick={this.onRemoveFromLibrary}
                            disabled={this.state.removing}
                        ><Glyph icon="circle-slash"/>
                            <span>Remove from library</span>
                        </Button> : null}
                </div>
            </div>
            {this.props.children}
        </div>;
    }

    @autobind
    onAddImageClick(e) {
        createImageModal.show({
            imageWidth: this.props.imageWidth,
            imageHeight: this.props.imageHeight,
            uploadUrl: this.props.uploadUrl,
            context: this.props.context
        })
            .then(dialogResult => {
                let options = this.state.selectOptions || [];
                let optionsToAdd = e.map(f => Object.assign(f, {
                    value: f._id,
                    label: f.filename
                }));

                Array.prototype.unshift.apply(options, optionsToAdd);

                this.props.onChange(optionsToAdd[0]);

                this.setState({
                    selectOptions: options
                });
            })
    }

    @autobind
    onSelectOpen(e) {
        let self = this;

        if (this.state.selectOptionsLoadedOnce) {
            return;
        }

        this.setState({
            selectLoading: true,
            error: null,
            selectOptionsLoadedOnce: true
        });
        return resources.file.find({
            context: this.props.context
        })
            .then(response => {
                let selectOptions = response.items.map(f => Object.assign(f, {
                    value: f._id,
                    label: f.filename
                }));
                self.setState({
                    selectOptions: selectOptions,
                    selectLoading: false
                });
            })
            .catch(err => {
                console.warn(err);
                self.setState({
                    error: err,
                    selectLoading: false,
                    selectOptions: []
                });
            });
    }

    @autobind
    onRemoveFromLibrary(e) {
        if (!this.props.value) {
            return;
        }

        if (!confirm('Really remove file forever?')) {
            return;
        }

        this.setState({
            removing: true,
            error: null
        });

        let self = this;
        let idToRemove = this.props.value._id;

        resources.file.remove(idToRemove)
            .then(response => {
                let options = self.state.selectOptions || [];
                let indexToRemove = options.findIndex(f => f._id === idToRemove);

                self.props.onChange(null);

                if (indexToRemove === -1) {
                    return;
                }

                options.splice(indexToRemove, 1);
                self.props.onChange(null);
                self.setState({
                    selectOptions: options,
                    removing: false
                });
            })
            .catch(err => {
                console.warn(err);
                self.setState({
                    error: err,
                    removing: false
                });
            })
    }
}

ImageLibrary.propTypes = {
    className: React.PropTypes.string,              // class for container
    value: React.PropTypes.object,                  // Selected image (file info object)
    onChange: React.PropTypes.func.isRequired,      // On change handler for controlled component
    imageWidth: React.PropTypes.number,
    imageHeight: React.PropTypes.number,
    uploadUrl: React.PropTypes.string,
    context: React.PropTypes.string
};
ImageLibrary.defaultProps = {
    imageWidth: 100,
    imageHeight: 100,
    uploadUrl: '/upload',
    context: 'avatarImage',
    className: ''
};

export default ImageLibrary;
import React from 'react';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';
import Form from 'elemental/lib/components/Form';
import FormField from 'elemental/lib/components/FormField';
import FormInput from 'elemental/lib/components/FormInput';
import FormRow from 'elemental/lib/components/FormRow';
import Radio from 'elemental/lib/components/Radio';
import {Creatable} from 'react-select';

import classnames from 'classnames';

import $filter from '../../../filter';

class PostForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tags: []
        };
    }

    render() {
        console.info('Post Form render: ', this.props);

        let postStatusClass = classnames({
            'inline-form-statics': true,
            'post-status-form': true,
            'jb-badge': true,
            'info': this.props.value.status === 'DRAFT',
            'success': this.props.value.status === 'PUB'
        });

        return <div className="post-edit-form">
            <h3>Edit post</h3>
            <div className="form-statics-ct">
                <div className={postStatusClass}>
                    {$filter('postStatus')(this.props.value.status)}
                </div>
                <div className="inline-form-statics">
                    <span>Created: </span>
                    <time
                        dateTime={this.props.value.createDate}>
                        {$filter('dateAndTime')(this.props.value.createDate)}
                    </time>
                </div>
                <div className="inline-form-statics">
                    <span>Updated: </span>
                    <time
                        dateTime={this.props.value.updateDate}>
                        {$filter('dateAndTime')(this.props.value.updateDate)}
                    </time>
                </div>
                <div className="inline-form-statics">
                    <span>Author: </span>
                    <b>{this.props.value.author}</b>
                </div>
                <div className="inline-form-statics">
                    <span>Id: </span>
                    <b>{this.props.value._id}</b>
                </div>
            </div>
            <hr/>
            <Form type="horizontal">
                <FormRow>
                    <FormField label="Title"
                               htmlFor="title">
                        <FormInput type="text"
                                   placeholder="Enter post title"
                                   name="title"
                                   value={this.props.value.title || ''}
                                   id="title"
                                   onChange={this.onInputChanged.bind(this)}/>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Brief annotation"
                               htmlFor="brief">
                        <FormInput type="text"
                                   placeholder="Enter post annotaion"
                                   name="brief"
                                   value={this.props.value.brief || ''}
                                   id="brief"
                                   onChange={this.onInputChanged.bind(this)}
                                   multiline
                                   className="form-textarea-brief"/>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Post content"
                               htmlFor="content">
                        <FormInput type="text"
                                   placeholder="Enter post content"
                                   name="content"
                                   value={this.props.value.content || ''}
                                   id="content"
                                   onChange={this.onInputChanged.bind(this)}
                                   multiline
                                   className="form-textarea-content"/>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Content type" width="one-third">
                        <div className="inline-controls">
                            <Radio name="contentType"
                                   label="HTML"
                                   value="HTML"
                                   checked={this.props.value.contentType === 'HTML'}
                                   onChange={this.onRadioChange.bind(this)}/>
                            <Radio name="contentType"
                                   label="Markdown MD"
                                   value="MD"
                                   checked={this.props.value.contentType === 'MD'}
                                   onChange={this.onRadioChange.bind(this)}/>
                        </div>
                    </FormField>
                    <FormField label="Tags" width="two-thirds">
                        <Creatable
                            name="tags"
                            multi={true}
                            value={this.props.value.tags}
                            options={this.props.tags}
                            onChange={this.onSelectTagsChange.bind(this)}
                            promptTextCreator={this.onPromptTextCreator.bind(this)}
                            isLoading={this.props.loadingTags}
                        />
                    </FormField>
                </FormRow>
            </Form>
        </div>;
    }

    onInputChanged(e) {
        this.props.onChange({
            [e.target.name]: e.target.value
        });
    }

    onRadioChange(e) {
        if (e.target.checked) {
            this.props.onChange({
                [e.target.name]: e.target.value
            });
        }
    }

    onSelectTagsChange(e) {
        console.info('Select Tag Change: ', e);
        this.props.onChange({
            tags: e
        });
    }

    onPromptTextCreator(e) {
        return `Add new tag "${e}"`;
    }
}

PostForm.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    tags: React.PropTypes.array,
    loadingTags: React.PropTypes.bool
};

export default PostForm;
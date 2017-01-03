import React from 'react';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';
import Form from 'elemental/lib/components/Form';
import FormField from 'elemental/lib/components/FormField';
import FormInput from 'elemental/lib/components/FormInput';
import FormRow from 'elemental/lib/components/FormRow';

import classnames from 'classnames';

import $filter from '../../../filter';

class PostForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let postStatusClass = classnames({
            'inline-form-statics': true,
            'post-status-form': true,
            'jb-badge': true,
            'info': this.props.value.status === 'DRAFT',
            'success': this.props.value.status === 'PUB'
        });

        return <div className="post-edit-form">
            <h3>Edit post</h3>
            <div>
                <span className={postStatusClass}>{$filter('postStatus')(this.props.value.status)}</span>
                <span className="inline-form-statics">Created: {$filter('dateAndTime')(this.props.value.createDate)}</span>
                <span className="inline-form-statics">Updated: {$filter('dateAndTime')(this.props.value.updateDate)}</span>
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
            </Form>
        </div>;
    }

    onInputChanged(e) {
        this.props.onChange({
            [e.target.name]: e.target.value
        });
    }

}

PostForm.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
};

export default PostForm;
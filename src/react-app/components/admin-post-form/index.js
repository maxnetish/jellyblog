import React from 'react';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';
import Form from 'elemental/lib/components/Form';
import FormField from 'elemental/lib/components/FormField';
import FormInput from 'elemental/lib/components/FormInput';
import FormRow from 'elemental/lib/components/FormRow';

class PostForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log('PostForm render: ', this.state);
        return <Form type="horizontal">
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
        </Form>;
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
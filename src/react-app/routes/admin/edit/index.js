import React from 'react';
import {withRouter} from 'react-router';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';
import Card from 'elemental/lib/components/Card';

import PostForm from '../../../components/admin-post-form';

import resources from '../../../../resources';
import {AdminPostStore, actions} from './store';

class AdminPost extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            post: {}
        };
        this.store = new AdminPostStore(this.state);
    }

    componentDidMount() {
        this.store.on(AdminPostStore.notificationEventKey, this.onStoreUpdate, this);
        actions.componentMounted(this.props);
    }

    componentWillUnmount() {
        this.store.removeListener(AdminPostStore.notificationEventKey, this.onStoreUpdate, this);
        this.store.unbind(actions);
    }

    render() {
        return <div className="post-edit-wrapper">
            <div className="post-edit-internal">
                <Card>
                    <PostForm value={this.state.post} onChange={this.onPostFieldChanged.bind(this)}/>
                </Card>
                <Button type="primary">
                    <Glyph icon="cloud-upload"/>
                    <span>Save</span>
                </Button>
            </div>
        </div>;
    }

    onStoreUpdate(updatedState) {
        this.setState(updatedState);
    }

    onPostFieldChanged(val) {
        actions.postFieldChanged(val);
    }

}

export default withRouter(AdminPost);
import React from 'react';

import Row from 'elemental/lib/components/Row';
import Col from 'elemental/lib/components/Col';
import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';

import PostBrief from '../../../components/admin-post-brief';

import resources from '../../../../resources';
import {AdminPostsStore, actions} from './store';

class AdminPosts extends React.Component {
    constructor(props) {
        super(props);

        console.info('instantiate Admin Postst');

        this.state = {
            posts: []
        };
        this.store = new AdminPostsStore(this.state);
    }

    componentDidMount() {
        this.store.on(AdminPostsStore.notificationEventKey, this.onStoreUpdate, this);
        actions.componentMounted(this.props);
    }

    componentWillUnmount() {
        this.store.removeListener(AdminPostsStore.notificationEventKey, this.onStoreUpdate, this);
        this.store.unbind(actions);
    }

    render() {
        return <div className="posts-list-wrapper">
            <div className="posts-list-internal">
                {this.state.posts.map(p => <PostBrief key={p._id} post={p}/>)}
            </div>
        </div>;
    }

    onStoreUpdate(updatedState) {
        this.setState(updatedState)
    }

    onCreateNewClick(e) {
        resources.post.create()
            .then(response => console.info(response));
    }
}

export default AdminPosts;
import React from 'react';
import {withRouter} from 'react-router';
import {autobind}   from 'core-decorators';

import ButtonGroup  from 'elemental/lib/components/ButtonGroup';
import Button       from 'elemental/lib/components/Button';
import Glyph        from 'elemental/lib/components/Glyph';
import Card         from 'elemental/lib/components/Card';
import Row          from 'elemental/lib/components/Row';
import Col          from 'elemental/lib/components/Col';

import PostForm from '../../../components/admin-post-form';

import resources from '../../../../resources';
import {AdminPostStore, actions} from './store';

const postStatusMap = {
    'DRAFT': {
        type: 'warning',
        icon: 'mirror-public',
        text: 'Publish',
        nextStatus: 'PUB'
    },
    'PUB': {
        type: 'success',
        icon: 'mirror-private',
        text: 'Stop publishing',
        nextStatus: 'DRAFT'
    }
};

class AdminPost extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            post: {},
            tags: [],
            loadingTags: false,
            changingStatus: false,
            dirty: false
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

        let locale = this.props.getUserLanguage();

        let actionButtonsBlock = null;

        if (this.state.post.status) {
            actionButtonsBlock = <Row>
                <Col xs="100%" className="text-right">
                    <ButtonGroup>
                        <Button
                            type={postStatusMap[this.state.post.status].type}
                            onClick={this.onPostStatusButtonClick}
                            disabled={this.state.dirty || this.state.changingStatus}
                        >
                            <Glyph icon={postStatusMap[this.state.post.status].icon}/>
                            <span>{postStatusMap[this.state.post.status].text}</span>
                        </Button>
                        <Button
                            type={this.state.dirty ? 'primary' : 'default-primary'}
                            disabled={!this.state.dirty}
                            onClick={this.onSaveButtonClick.bind(this)}
                        >
                            <Glyph icon="cloud-upload"/>
                            <span>{this.state.dirty ? 'Save' : 'Saved'}</span>
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>;
        }

        return <div className="post-edit-wrapper">
            <div className="post-edit-internal">
                {actionButtonsBlock}
                <Card className="_margin-1em _top">
                    <PostForm
                        value={this.state.post}
                        onChange={this.onPostFieldChanged.bind(this)}
                        tags={this.state.tags}
                        loadingTags={this.state.loadingTags}
                        locale={locale}
                    />
                </Card>
                {actionButtonsBlock}
            </div>
        </div>;
    }

    @autobind
    onPostStatusButtonClick(e) {
        let nextStatus = postStatusMap[this.state.post.status].nextStatus;
        switch (nextStatus) {
            case 'PUB':
                actions.setPubStatusClick(this.state.post);
                break;
            case 'DRAFT':
                actions.setDraftStatusClick(this.state.post);
                break;
        }
    }

    onStoreUpdate(updatedState) {
        this.setState(updatedState);
    }

    onPostFieldChanged(val) {
        actions.postFieldChanged(val);
    }

    onSaveButtonClick(e) {
        actions.saveButtonClick(this.state.post);
    }
}

export default withRouter(AdminPost);
import React                from 'react';

import {Link}               from 'react-router';

import Button               from 'elemental/lib/components/Button';
import Glyph                from 'elemental/lib/components/Glyph';
import Card                 from 'elemental/lib/components/Card';

import {autobind}           from 'core-decorators';

import classnames           from 'classnames';
import fileStoreConfig      from '../../../../config/file-store.json';
import {filter as $filter}  from '../../../filter';

class PostBrief extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };
    }

    componentDidUpdate(prevProps, prevState) {

    }

    render() {
        const post = this.props.post;

        const postStatusClass = classnames({
            'jb-badge': true,
            'warning': post.status === 'DRAFT',
            'success': post.status === 'PUB'
        });

        const rootClass = classnames({
            'post-brief-ct': true,
            'collapsed': this.state.collapsed
        });

        const postAvatarUrl = post.titleImg ? `${fileStoreConfig.gridFsBaseUrl}/${post.titleImg.filename}` : undefined;

        let displayDate;
        switch (post.status) {
            case 'DRAFT':
                displayDate = post.createDate;
                break;
            case 'PUB':
                displayDate = post.pubDate;
                break;
            default:
                displayDate = post.createDate;
                break;
        }

        return <div className={rootClass}>
            <Card className="post-brief-internal">
                {postAvatarUrl ?
                    <div className="post-brief-left _margin-5 _right">
                        <img className="post-brief-avatar-img" src={postAvatarUrl}/>
                    </div> :
                    null}
                <div className="post-brief-right">
                    <h3 className="collapsable-ct">
                        <Link to={`/admin/edit/${this.props.post._id}`}>{post.title}</Link>
                    </h3>
                    <div className="collapsable-ct" onClick={this.onBriefClick}>
                        {post.brief}
                    </div>
                    <div>
                        <small>
                            <time
                                dateTime={displayDate}>
                                {$filter('dateWithoutTime')(displayDate)}
                            </time>
                        </small>
                    </div>
                    <div>
                        <small className={postStatusClass}>
                            {$filter('postStatus')(post.status)}
                        </small>
                    </div>
                </div>
            </Card>
        </div>
    }

    @autobind
    onBriefClick(e) {
        this.setState({
            collapsed: false
        });
    }

}

PostBrief.propTypes = {
    post: React.PropTypes.object
};

PostBrief.defaultProps = {
    post: {}
};

export default PostBrief;
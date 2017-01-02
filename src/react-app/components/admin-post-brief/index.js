import React from 'react';

import {Link} from 'react-router';

import Button from 'elemental/lib/components/Button';
import Glyph from 'elemental/lib/components/Glyph';
import Card from 'elemental/lib/components/Card';

class PostBrief extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidUpdate(prevProps, prevState) {

    }

    render() {
        return <div className="post-brief-ct">
            <Card className="post-brief-internal">
                <div>
                    <h3>
                        <Link to={`/admin/edit/${this.props.post._id}`}>{this.props.post.title}</Link>
                    </h3>
                </div>
                <div>
                    {this.props.post.brief}
                </div>
                <div>
                    <small>{(new Date(this.props.post.updateDate)).toLocaleString()}</small>
                </div>
            </Card>
        </div>
    }

}

PostBrief.propTypes = {
    post: React.PropTypes.object
};

export default PostBrief;
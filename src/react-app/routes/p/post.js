import React from 'react';

class Post extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return <div>
            <h3>Post component (restricted)</h3>
            <div>Props.params:</div>
            <pre>{JSON.stringify(this.props.params, '', 4)}</pre>
        </div>;
    }

    static get requireRoles() {
        return ['admin'];
    }

    static get componentId() {
        return 'Post';
    }
}

export default Post;

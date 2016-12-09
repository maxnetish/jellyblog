import React from 'react';

function Post(props) {
    return <div>
        <h3>Post component</h3>
        <div>Props.params:</div>
        <pre>{JSON.stringify(props.params, '', 4)}</pre>
    </div>;
}

export default Post;

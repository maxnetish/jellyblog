import React from 'react';

function Posts(props) {
    return <div>
        <h3>Posts component</h3>
        <div>Props.params:</div>
        <pre>{JSON.stringify(props.params, '', 4)}</pre>
    </div>;
}

export default Posts;
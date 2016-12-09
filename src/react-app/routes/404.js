import React from 'react';

function Page404(props) {
    return <div>
        <h3>404: not found</h3>
        <div>Props.params:</div>
        <pre>{JSON.stringify(props.params, '', 4)}</pre>
    </div>;
}

export default Page404;
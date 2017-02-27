import React from 'react';

function About(props) {
    return <div>
        <h3>About component</h3>
        <div>Props.params:</div>
        <pre>{JSON.stringify(props.params, '', 4)}</pre>
    </div>;
}

export default About;
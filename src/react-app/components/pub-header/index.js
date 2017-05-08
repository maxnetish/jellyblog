import React from 'react';
import {withRouter} from 'react-router';

import Button                       from 'elemental/lib/components/Button';
import Glyph                        from 'elemental/lib/components/Glyph';

import {getText}                    from '../../../i18n';

function PubHeaderComponent(props) {

    let xMarkup = <header className="jb-pub-header">
        <div className="jb-pub-header-internal">
            HEADER
        </div>
    </header>;

    return xMarkup;
}

export default withRouter(PubHeaderComponent);
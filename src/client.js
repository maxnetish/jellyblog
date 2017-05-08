/**
 * Init polyfills
 */
require('core-js/es6/array');
require('core-js/es6/promise');
require('core-js/es6/object');
require('core-js/es6/symbol');

import routes from './react-app/routes';
import {routerRun} from './isomorph-utils/front';

routerRun({routes});

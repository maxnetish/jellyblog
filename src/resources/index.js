/**
 * We use https://github.com/d-oliveros/isomorphine
 */

//
// We should _require_ isomorphine else isomorphine webpack loader will not be able to recognize 'isomorphine[dot]proxy()' token
// Also we shouldn't use string 'isomorphine[dot]proxy()' even in comments

import isomorphine from 'isomorphine';
export default isomorphine.proxy(__dirname);
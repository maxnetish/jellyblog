/**
 * We use https://github.com/d-oliveros/isomorphine
 *
 * TODO Надо избавиться от isomorphine: похоже не поддерживается, есть проблемы с серверной сборкой вебпаком
 */

//
// We should _require_ isomorphine else isomorphine webpack loader will not be able to recognize 'isomorphine[dot]proxy()' token
// Also we shouldn't use string 'isomorphine[dot]proxy()' even in comments

// import isomorphine from 'isomorphine';
// export default isomorphine [dot] proxy(__dirname);
// export default isomorphine.proxy();
export default {
    old: true
};
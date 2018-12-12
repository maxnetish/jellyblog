// implement external store
// see https://github.com/koajs/session
// const store = {
//     get(key, maxAge, { rolling }): get session object by key,
//     set(key, sess, maxAge, { rolling, changed }): set session object for key, with a maxAge (in ms),
// destroy(key): destroy session for key
// };

const config = {
    // key: 'sid',
    maxAge: 1000 * 60 * 60 * 24 * 1,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: true,
    renew: true
};



export default config;
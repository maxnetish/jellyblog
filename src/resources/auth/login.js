import passport from 'passport';

function login(loginData) {

    let self = this;

    return new Promise((resolve, reject) => {
        if (!self.xhr) {
            // allow only rpc call
            reject(500);
            return;
        }
        if (self.req.user && self.req.user.userName) {
            reject(400);
        }

        passport.authenticate('local', (err, user) => {
            if (err) {
                reject(401);
                return;
            }
            if (!user) {
                reject(401);
                return;
            }
            self.req.login(user, function (err) {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(user);
            });
            // resolve(user);
        })(self.req);
    });
}

export default login;
function getUser() {

    let self = this;

    return new Promise((resolve, reject) => {
        if (!self.xhr) {
            // allow only rpc call
            reject(500);
            return;
        }
        resolve(Object.assign({}, self.req.user));
    });
}

export default getUser;
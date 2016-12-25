function logout() {

    let self = this;

    return new Promise((resolve, reject) => {
        if (!self.xhr) {
            // allow only rpc call
            reject(500);
            return;
        }
        self.req.logout();
        resolve({});
    });
}

export default logout;
function fetch() {
    let self = this;
    let result = this.req && this.req.user;

    return Promise.resolve(result);
}

export default fetch;
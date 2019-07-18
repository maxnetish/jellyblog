import Application = require("koa");

export interface IAppBuilder {
    createApp: () => Application
}

import {Container} from "inversify";
import {Server} from "http";
import dotenv from "dotenv";
import {IAppBuilder} from "./app-builder";
import {TYPES} from "./ioc/types";

export async function runServer(container: Container): Promise<Server> {

    // read .env file
    const dotenvResult = dotenv.config();
    const portToListen = parseInt(process.env.PORT || '3000', 10) || 3000;
    const appBuilder = container.get<IAppBuilder>(TYPES.AppBuilder);
    const app = await appBuilder.createApp();

    return new Promise((resolve, reject) => {
        const httpServer = app.listen(portToListen, () => {
            console.info(`Started and listening on port ${portToListen}. app.env: ${app.env}`);
            resolve(httpServer);
        });
    })
        .then(null, err => {
            console.error('Failed start server.', err);
            throw err;
        });
}

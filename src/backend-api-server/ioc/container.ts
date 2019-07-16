import {Container} from "inversify";
import {TYPES} from "./types";
import {TokenOptions} from "../token/impls/token-options";
import {ITokenOptions} from "../token/api/token-options";
import {ITokenService} from "../token/api/token-service";
import {TokenService} from "../token/impls/token-service";
import {ILogService} from "../log/api/log-service";
import {LogService} from "../log/impls/log-service";

export const container = new Container({
    defaultScope: 'Singleton'
});

container.bind<ITokenOptions>(TYPES.JwtTokenOptions).toConstantValue(new TokenOptions());
container.bind<ITokenService>(TYPES.JwtTokenService).to(TokenService);
container.bind<ILogService>(TYPES.LogService).toConstantValue(new LogService());

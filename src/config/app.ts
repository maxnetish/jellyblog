const appConfig = new Map<string, any>([
    ['port', 3000],
    ['cors', {
      maxAge: 3600,
      credentials: true,
      origin: 'http://localhost:4200'
    }],
]);

export {
  appConfig
}

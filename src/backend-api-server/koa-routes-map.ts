/*
{
  "upload": "/upload",
  "api": "/api",
  "admin": "/admin",
  "login": "/admin/login",
  "logout": "/admin/logout",
  "preview": "/admin/preview",
  "post": "/post",
  "tag": "/tag",
  "dbDump": "/maintenance/dump",
  "dbRestore": "/maintenance/restore",
  "sitemap": "/sitemap.xml",
  "userContext": "/current/user",
  "echo": "/echo",
  "token": "/token"
}
*/

const koaRoutesMap = new Map<string, string>([
    ['api', '/api'],
    ['echo', '/echo'],
    ['token', '/token']
]);

export {
    koaRoutesMap
}

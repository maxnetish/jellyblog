Here try to implement private web blog with stack:
 * [mongoose](https://mongoosejs.com/) - [mongo](https://www.mongodb.com/)
 * [koa](https://koajs.com/)
 * [vue](https://vuejs.org/)

```
npm install
npm run build-dev
// or
npm run build-prod
```

ES7, flex etc...

### Config files
In order not to forget...

In _config_ dir we should place several json files. From these files,
the application will read various parameters, including security settings.

_auth.json_: list of users

```json
[
  {
    "userName": "derpy_hooves",
    "password": "SecretPassword",
    "role": "admin"
  },
  {
      "userName": "flutty",
      "password": "Strong",
      "role": "reader"
  }
]
```

_file-store.json_:

```json
{
  "gridFsBaseUrl": "/file",
  "fields": [
    {
      "name": "attachment",
      "maxCount": 3
    },
    {
      "name": "avatarImage",
      "maxCount": 1
    },
    {
      "name": "upload",
      "maxCount": 3
    }
  ]
}
```

_mongoose.json_: connection to mongodb

```json
{
  "connectionUri": "mongodb://localhost/jellyblog",
  "connectionOptions": {
    "config": {
      "autoIndex": true
    }
  },
  "paginationDefaultLimit": 10,
  "commandDump": "mongodump -d jellyblog --quiet --gzip --archive",
  "dumpFilename": "blog.archive.gz",
  "commandRestore": "mongorestore --nsFrom jellyblog.* --nsTo jellyblog-check-restore.* --gzip"
}
```

_routes-map.json_:

```json
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
  "userContext": "/current/user"
}
```

_app.json_:
allow cors requests here
```json
{
  "port": 3000,
  "cookieSecret": "非常に秘密のフレーズ",
  "cors": {
    "maxAge": 3600,
    "credentials": true,
    "origin": "https://allow-origin-domain"
  }
}
```

_pub-settings.json_:
```json
{
  "GoogleAnalyticsApiKey": "UA-GOOGLE_KEY_HERE",
  "postsPerPage": 5,
  "showdownOptions": {
      "strikethrough": true,
      "encodeEmails": true,
      "openLinksInNewWindow": true,
      "backslashEscapesHTMLTags": false,
      "emoji": true
    },
  "hostname": "https://my.app"
}
```

Also see <https://github.com/webpack/webpack/issues/8656#issuecomment-456010969> to walkaround with acorn dependency.

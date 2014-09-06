Deployment
==========
You have to execute:

npm install
bower install
grunt

Edit config files in /config:
    1. auth.json:
        "admin": "<example@gmail.com>" // google e-mail of user who will be admin
    2. url.json:
        "host": "<http://localhost:3000>" // public url
    3. google-app.json:
        This file contains app identification data to use with google oauth service.
        You need to register web application at https://console.developers.google.com
        and download json file from 'credentials'.

Run:

NODE_ENV=production node bin/www

Admin interface here: <host>/admin



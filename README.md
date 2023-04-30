# NodeBB OpenID for Keycloak

Adapted from:
https://github.com/julianlam/nodebb-plugin-sso-oauth


## How to Use

Edit the Config JSON file and add:
```
    "oauth": {
       "id": "my_client_id",
       "secret": "my_secret",
       "auth": "auth_url",
       "token": "token_url",
       "userinfo": "userinfo_url"
    }
```

(don't forget the "," after "}" unless last block)

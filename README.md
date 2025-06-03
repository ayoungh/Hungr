Hungr
=====

A Node web app for sharing what food you enjoy with friends and family.

## 2025 update

Dependencies and server configuration have been refreshed to work with modern
versions of Node.js (tested with Node 20) and MongoDB. See `package.json` for
the updated dependency list.

The idea of this is to learn node.js and angular.js by creating an app to share food with friends and family. I love food and like trying new foods, but want to be able to share these new foods with friends and family without the usual instagram upload.

Plan so far:

Create a node.js server that will handle all of the data

###Routes
	/api
	/api/foods
	/api/foods/food_id
	/api/users
	/api/users/user_id

Create a frontend (single page app) with angular.js 


## TODO

- [x] Basic rest routes created
- [ ] Get Authentication of users working
- [ ] Add auth checking to food items
- [ ] Start coding the basic structure of the frontend app

## Authentication

The server exposes `/api/auth` which returns a JSON Web Token (JWT). Make a POST
request to this endpoint and the response will include a `token` field.

Example using `curl`:

```bash
curl -X POST http://localhost:3000/api/auth
```

Use the returned token in the `Authorization` header (as `Bearer <token>`) when
calling other API routes. For instance, to fetch all foods:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/foods
```

Include the same header when creating or updating food items.











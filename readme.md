<h2 align="center">@lxghtless/openid-client-server-redis-session</h2>

<p align="center">
    A Redis session store for 
	<a href="https://www.npmjs.com/package/@optum/openid-client-server">
		@optum/openid-client-server
	</a>.
</p>

<p align="center">
	<a href="https://www.npmjs.com/package/@lxghtless/openid-client-server-redis-session">
		<img src="https://img.shields.io/npm/v/@lxghtless/openid-client-server-redis-session?color=blue" />
	</a>
	<a href="https://www.typescriptlang.org/">
		<img src="https://aleen42.github.io/badges/src/typescript.svg" />
	</a>
	<a href="https://eslint.org/">
		<img src="https://aleen42.github.io/badges/src/eslint.svg" />
	</a>
</p>

<p align="center">
  <h3 align="center">Install</h3>
</p>

<pre align="center">npm i @lxghtless/openid-client-server-redis-session</pre>

<br />

<pre align="center">yarn add @lxghtless/openid-client-server-redis-session</pre>

### Basic Usage

```ts
import RedisSessionStore from '@lxghtless/openid-client-server-redis-session'

// Any option from https://www.npmjs.com/package/redis#rediscreateclient
const redisClientOptions = {
    host: '127.0.0.1:6379'
}

// A string used to prefix sessionId's for storing in redis
const sessionKeyPrefix = 'web-app-sessions'

const sessionStore = new RedisSessionStore(redisClientOptions, sessionKeyPrefix)
```

### With Auth

```ts
import RedisSessionStore from '@lxghtless/openid-client-server-redis-session'

// Any option from https://www.npmjs.com/package/redis#rediscreateclient
const redisClientOptions = {
    host: '127.0.0.1:6379'
}

// A string used to prefix sessionId's for storing in redis
const sessionKeyPrefix = 'web-app-sessions'

const sessionStore = new RedisSessionStore(redisClientOptions, sessionKeyPrefix)

const redisPassword = 'PasswordToAccessRedis'

await sessionStore.client.auth(redisPassword)
```

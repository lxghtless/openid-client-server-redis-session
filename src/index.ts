/* eslint-disable unicorn/no-null */
import {EventEmitter} from 'events'
// TODO: switch to root import once @optum/openid-client-server publishes the next package update
import {Json} from '@optum/openid-client-server/dist/json'
import {Session, SessionStore} from '@optum/openid-client-server/dist/session'
import {IHandyRedis, createHandyClient} from 'handy-redis'
import {ClientOpts, RedisClient} from 'redis'
import {TokenSet} from 'openid-client'

/**
 * Class representing a SessionStore with a Redis implementation
 * @implements SessionStore
 */
export class RedisSessionStore implements SessionStore {
    client: IHandyRedis
    keyPrefix: string
    keysPattern: string

    /**
     * Create a RedisSessionStore.
     * @param {(ClientOpts|RedisClient)} optionsOrClient - Redis ClientOpts or a pre-created RedisClient.
     * @param {string} keyPrefix - A string used to prefix sessionId's for storing in redis.
     */
    constructor(optionsOrClient: ClientOpts | RedisClient, keyPrefix: string) {
        // NOTE: idk, this seems to make TS happy even though it's not needed in JS land
        if (optionsOrClient instanceof EventEmitter) {
            this.client = createHandyClient(optionsOrClient)
        } else {
            this.client = createHandyClient(optionsOrClient)
        }
        this.keyPrefix = keyPrefix
        this.keysPattern = `${this.keyPrefix}:*`
    }

    sessionKey(sessionId: string): string {
        return `${this.keyPrefix}:${sessionId}`
    }

    withTokenSet(session: Session): Session {
        if (session.tokenSet) {
            Object.assign(session, {
                tokenSet: new TokenSet(session.tokenSet)
            })
        }
        return session
    }

    /*
        NOTE: consider removing this from the interface in @optum/openid-client-server
        as it doesn't appear to be used
    */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async clear(): Promise<void> {}

    async destroy(sessionId: string): Promise<void> {
        await this.client.del(this.sessionKey(sessionId))
    }

    async get(sessionId: string): Promise<Session | undefined> {
        const sessionString = await this.client.get(this.sessionKey(sessionId))
        if (sessionString) {
            const session: Session = JSON.parse(sessionString)
            return this.withTokenSet(session)
        }
    }

    async getByPair(key: string, value: string): Promise<Session | undefined> {
        /*
            NOTE: Until we come up with an alternative to this method being needed
            in @optum/openid-client-server, we'll have to do this even though it's
            not the greatest practice with redis.
        */
        const allKeys = await this.client.keys(this.keysPattern)
        for (const rKey of allKeys) {
            const rValue = await this.client.get(rKey)
            if (rValue) {
                const session: Session = JSON.parse(rValue)
                if (session[key] === value) {
                    return this.withTokenSet(session)
                }
            }
        }
    }

    // TODO: consider moving to Partial<Session> from Json type in @optum/openid-client-server
    async set(sessionId: string, sessionPatch: Json): Promise<void> {
        const sessionKey = this.sessionKey(sessionId)
        let rValue = await this.client.get(sessionKey)

        if (!rValue) {
            rValue = JSON.stringify({
                sessionId,
                createdAt: Date.now(),
                csrfString: null,
                codeVerifier: null,
                tokenSet: null,
                userInfo: null,
                sessionState: null,
                fromUrl: null,
                securedPathFromUrl: null
            })
        }

        await this.client.set(
            sessionKey,
            JSON.stringify(Object.assign(JSON.parse(rValue), sessionPatch))
        )
    }
}

export default RedisSessionStore

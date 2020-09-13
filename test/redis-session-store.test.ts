import {RedisSessionStore} from '../src'
import redis from 'redis-mock'
import {Json} from '@optum/openid-client-server/dist/json'
import {v4 as uuid} from 'uuid'
import {TokenSet} from 'openid-client'

const {beforeEach, afterEach, describe, it} = intern.getPlugin('interface.bdd')
const {expect} = intern.getPlugin('chai')

describe('redis-session-store', () => {
    const keyPrefix = 'unit-test-prefix'
    let redisClient: redis.RedisClient

    beforeEach(() => {
        redisClient = redis.createClient()
    })

    afterEach(() => {
        if (redisClient) {
            redisClient.flushall()
        }
    })

    it('should set new sessions with patch & existing session', async () => {
        const sessionId = uuid()
        const csrfString = uuid()
        const sessionPatch: Json = {
            userInfo: {
                sub: uuid(),
                name: 'Unit Test'
            }
        }
        const sessionStore = new RedisSessionStore(redisClient, keyPrefix)

        await sessionStore.set(sessionId, sessionPatch)

        let session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined
        expect(session?.userInfo).to.deep.equal(sessionPatch.userInfo)

        await sessionStore.set(sessionId, {
            csrfString
        })

        session = await sessionStore.get(sessionId)

        expect(session?.userInfo).to.deep.equal(sessionPatch.userInfo)
        expect(session?.csrfString).to.equal(csrfString)
    })

    it('should return with TokenSet instance if session.tokenSet is defined', async () => {
        const sessionId = uuid()
        const sessionPatch: Json = {
            tokenSet: {
                access_token: uuid(),
                id_token: uuid(),
                refresh_token: uuid(),
                token_type: 'bearer',
                expires_at: 123456789101112
            }
        }
        const sessionStore = new RedisSessionStore(redisClient, keyPrefix)

        await sessionStore.set(sessionId, sessionPatch)

        const session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined
        expect(session?.tokenSet instanceof TokenSet).to.be.true
    })

    it('should delete a session as expected', async () => {
        const sessionId = uuid()
        const sessionPatch: Json = {}
        const sessionStore = new RedisSessionStore(redisClient, keyPrefix)

        await sessionStore.set(sessionId, sessionPatch)

        let session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined

        await sessionStore.destroy(sessionId)

        session = await sessionStore.get(sessionId)

        expect(session).to.be.undefined
    })

    it('should get by key value pair', async () => {
        const sessionId = uuid()
        const csrfString = uuid()
        const sessionPatch: Json = {
            csrfString
        }
        const sessionStore = new RedisSessionStore(redisClient, keyPrefix)

        await sessionStore.set(sessionId, sessionPatch)

        let session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined

        session = await sessionStore.getByPair('csrfString', csrfString)

        expect(session).to.not.be.undefined
        expect(session?.csrfString).to.equal(csrfString)
    })
})

// src/index.ts
import { Hono } from 'hono'

const app = new Hono()

/* ---------- 常量 ---------- */
const REGISTRY_UPSTREAM = 'https://registry-1.docker.io'
const AUTH_UPSTREAM     = 'https://auth.docker.io'
/* -------------------------------- */

/* 工具：拼自己的域名 */
function selfHost(c: any): string {
    return `https://${c.env.DOMAIN}`   // wrangler.toml 里 [vars] DOMAIN = "docker.example.com"
}

/* 把上游响应搬回来，顺便改写 www-authenticate 等 */
async function cloneUpstream(resp: Response, c: any): Promise<Response> {
    const h = new Headers(resp.headers)

    /* 1. 禁用缓存 */
    h.set('cache-control', 'no-cache, no-store, must-revalidate')

    /* 2. 重写 www-authenticate */
    const rawWwwAuth = h.get('www-authenticate')
    if (rawWwwAuth) {
        h.delete('www-authenticate')
        const newAuth = rawWwwAuth
            .replace(/realm="[^"]*"/, `realm="${selfHost(c)}/token"`)
            .replace(/service="[^"]*"/, `service="registry.docker.io"`)
        h.set('www-authenticate', newAuth)
    }

    /* 3. 重写 30x Location */
    if (h.has('location')) {
        const loc = h.get('location')!
        if (loc.startsWith(REGISTRY_UPSTREAM)) {
            h.set('location', loc.replace(REGISTRY_UPSTREAM, selfHost(c)))
        }
    }

    return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: h
    })
}

/* 构造通用头 */
function buildHeaders(c: any, host: string): Headers {
    const h = new Headers()
    c.req.raw.headers.forEach((v, k) => h.set(k, v))
    h.set('host', host)
    h.set('x-real-ip',       c.req.header('cf-connecting-ip') ?? c.req.header('x-real-ip') ?? '')
    h.set('x-forwarded-for', c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? '')
    h.set('x-forwarded-proto', 'https')
    return h
}

/* ---------- 路由 ---------- */

/* 1. /v2/* 镜像仓库反代 */
app.use('/v2/*', async c => {
    const url = new URL(c.req.path + (new URL(c.req.url).search || ''), REGISTRY_UPSTREAM)
    const headers = buildHeaders(c, 'registry-1.docker.io')

    let resp = await fetch(url, {
        method: c.req.method,
        headers,
        body: c.req.body
    })

    /* 手动处理 30x 重定向 */
    if ([301, 302, 307].includes(resp.status)) {
        const loc = resp.headers.get('location')
        if (loc) {
            resp = await fetch(loc, {
                method: c.req.method,
                headers,
                body: c.req.body
            })
        }
    }

    return cloneUpstream(resp, c)
})

/* 2. /token 认证服务器反代 */
app.use('/token', async c => {
    const url = new URL('/token' + (new URL(c.req.url).search || ''), AUTH_UPSTREAM)
    const headers = buildHeaders(c, 'auth.docker.io')

    const resp = await fetch(url, {
        method: c.req.method,
        headers,
        body: c.req.body
    })

    return cloneUpstream(resp, c)
})

/* 3. 其余路径 404 */
// app.all('*', c => c.notFound())

export default app
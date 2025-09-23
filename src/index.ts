// src/index.ts
import { Hono } from 'hono'

const app = new Hono()

const UPSTREAM = 'https://registry-1.docker.io'

app.all('/*', async c => {
    // 1. 拼装目标 URL
    const url = new URL(c.req.path + c.req.query, UPSTREAM)

    // 2. 构造新请求头
    const headers = new Headers(c.req.header())
    headers.set('Host', 'registry-1.docker.io')        // 对应 nginx 的 proxy_set_header Host
    headers.set('X-Real-IP', c.req.header('cf-connecting-ip') ?? '')
    headers.set('X-Forwarded-For', c.req.header('cf-connecting-ip') ?? '')
    headers.set('X-Forwarded-Proto', c.req.header('x-forwarded-proto') ?? 'https')

    // 3. 发请求
    const resp = await fetch(url.toString(), {
        method: c.req.method,
        headers,
        body: c.req.body
    })

    // 4. 把上游响应原样返回（30x 自动跟随，无需额外处理）
    return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: resp.headers
    })
})

export default app
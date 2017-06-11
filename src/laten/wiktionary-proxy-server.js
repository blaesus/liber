const url = require('url')
const Koa = require('koa')
const fetch = require('node-fetch')

const app = new Koa()

app.use(async (context, next) => {
  if (context.url.startsWith('/api/fetch')) {
      const targetUrl = context.url.replace('/api/fetch/', '')
      const request = url.parse(targetUrl)
      if (request.hostname === 'en.wiktionary.org') {
          const result = await fetch(targetUrl)
          context.body = await result.text()
      }
  }
  await next()
})

app.listen(10000, () => console.info('Latin-English Dictionary Proxy started'))
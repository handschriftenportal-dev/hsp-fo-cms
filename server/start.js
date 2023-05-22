/*
 * MIT License
 *
 * Copyright (c) 2021 Staatsbibliothek zu Berlin - Preußischer Kulturbesitz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

const path = require('path')
const express = require('express')
const httpProxy = require('http-proxy')

const host = 'localhost'
const port = 8080
const wordpressEndpoint = 'http://handtest.handschriftenportal.de'
const wordpressCssFile =
  process.env.WORDPRESS_CSS_FILE ||
  '/wp-includes/css/dist/block-library/style.min.css'
const wordpressResolveEndpoint =
  process.env.WORDPRESS_RESOLVE_ENDPOINT || '/api/url'
const root = path.join(__dirname, '../dist')
const app = express()
const proxy = httpProxy.createProxyServer({ followRedirects: true })

app.use(express.static(root))

app.get(
  [
    '/api/wordpress/wp-json/*',
    '/api/wordpress/wp-content/*',
    '/api/wordpress/css',
  ],
  function (req, res) {
    req.url = req.url.replace('/api/wordpress', '')
    req.url = req.url.replace('/css', wordpressCssFile)
    proxy.web(req, res, {
      target: wordpressEndpoint,
      changeOrigin: true,
    })
  }
)

app.get([wordpressResolveEndpoint], function (req, res) {
  const originalUrl = req.query.originalUrl || '/'
  res.redirect(originalUrl.replace(wordpressEndpoint, '/api/wordpress'))
})

app.get('/*', function (req, res) {
  res.sendFile(path.join(root, 'index.html'))
})

app.listen(port, host, function () {
  console.log(`server listening on port ${port}`)
})

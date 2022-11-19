const path = require('path')
const crypto = require('crypto')
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const hljs = require('highlight.js')

const app = express()
const prisma = new PrismaClient()

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

app.get('/', (request, response) => response.render('index'))

app.get('/p/:hash', async (request, response) => {
  const paste = await prisma.paste.findFirst({
    where: { hash: request.params.hash },
  })
  const highlighted = hljs.highlightAuto(paste.content).value
  response.render('paste', { content: highlighted })
})

app.post('/', async (request, response) => {
  const { code } = request.body
  const paste = await prisma.paste.create({
    data: {
      hash: crypto.randomUUID(),
      content: code,
    },
  })
  response.redirect(`/p/${paste.hash}`)
})

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server ready at: http://${HOST}:${PORT}`)
})

const express = require('express')
const app = express()
const cors = require('cors')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:', request.path)
    console.log('Body:', request.body)
    console.log('---')
    next()
}

app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static('build'))

let blogs = [
    {
        author: "Ruus",
        title: "Stud Book",
        url: ".com",
        likes: 5,
        id: 0
    },
    {
        author: "JB",
        title: "Teh Life...",
        url: ".org",
        likes: 1,
        id: 1
    }
]

app.get('/api/blogs', (request, response) => {
    response.json(blogs)
})

app.get('/api/blogs/:id', (request, response) => {
    const id = Number(request.params.id)
    const blog = blogs.find(blog => blog.id === id)

    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    response.end(`The blog list has info for ${blogs.length} blogs. ${Date()}`)
})

app.put('/api/blogs/:id', (request, response, next) => {
    const id = Number(request.params.id)
    console.log('id inside of the put', id)

    const blog = blogs.map(b => {
        if (b.id === id) { b.likes++ }
    })
    response.json(blog)

})

app.delete('/api/blogs/:id', (request, response) => {
    const id = Number(request.params.id)
    blogs = blogs.filter(blog => blog.id !== id)

    response.status(204).end()
})

const generateID = () => {
    const maxId = blogs.length > 0
        ? Math.max(...blogs.map(b => b.id))
        : 0
    return maxId + 1
}

app.post('/api/blogs', (request, response) => {
    const body = request.body
    const title = body.title
    const author = body.author
    const url = body.url

    if (body === undefined) {
        return response.status(400).json({ error: 'error missing' })
    }
    if (title === undefined) {
        return response.status(400).json({ error: 'title missing' })
    }
    if (author === undefined) {
        return response.status(400).json({ error: 'author missing' })
    }
    if (url === undefined) {
        return response.status(400).json({ error: 'url missing' })
    }

    const blog = {
        author: body.author,
        title: body.title,
        url: body.url,
        likes: body.likes,
        id: generateID()
    }

    blogs = blogs.concat(blog)

    response.json(blog)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unkown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(404).send({ error: 'malformed id' })
    } else if (error.name === 'ValidationError') {
        return response.status(404).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
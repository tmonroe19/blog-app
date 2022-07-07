const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Blog = require('./models/blog')

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

    const blog = new Blog({
        author: author,
        title: title,
        url: url,
        likes: 0
    })

    blog
        .save()
        .then(savedBlog => {
            console.log({ savedBlog })
            response.json(savedBlog)
        })
})

app.get('/api/blogs', (request, response) => {
    Blog
        .find({})
        .then(blogs => {
            response.json(blogs)
        })
})

app.get('/api/blogs/:id', (request, response) => {
    Blog
        .findById(request.params.id)
        .then(blog => {
            response.json(blog)
        })
})

app.get('/info', (request, response) => {
    response.end(`The blog list has info for ${blogs.length} blogs. ${Date()}`)
})

app.put('/api/blogs/:id', (request, response, next) => {
    const id = request.params.id
    const likes = request.body.likes

    const newBlog = { likes: likes }

    Blog
        .findByIdAndUpdate(id, newBlog, { new: true, runValidators: true, context: 'query' })
        .then(updatedBlog => {
            response.json(updatedBlog)
        })
        .catch(error => next(error))
})

app.delete('/api/blogs/:id', (request, response) => {
    Blog
        .findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unkown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error("error:", error.message)

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
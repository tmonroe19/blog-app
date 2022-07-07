const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
const url = `mongodb+srv://tmonroe:${password}@cluster0.r5b4z.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(url)

const blogSchema = new mongoose.Schema({
    author: String,
    title: String,
    url: String,
    likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
    author: "JB",
    title: "Teh Life...",
    url: ".org",
    likes: 1,
})

blog
    .save()
    .then(result => {
        console.log('blog saved!')
        mongoose.connection.close()
    })

Blog
    .find({})
    .then(result => {
        result.forEach(blog => {
            console.log(blog)
        })
        mongoose.connection.close()
    })
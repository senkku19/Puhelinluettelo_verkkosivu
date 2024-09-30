require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (request) => JSON.stringify(request.body))

app.get('/info', (request, response) => {
    const timeStamp = new Date()
    const entryCount = persons.length
    
    response.send(`
        <div>
            <p>Phonebook has info for ${entryCount} people</p>
            <p>${timeStamp}</p>
        </div>
    `)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request,response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person){
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const generateId = () => {
    let id
    const maxId = persons.length*10
    do{
        id = Math.floor(Math.random()* maxId)
    } while (persons.find(person => person.id === id))

    return String(id);
}

const morganPost = morgan(':method :url :status :res[content-length] - :response-time ms :body')

app.post('/api/persons', morganPost, (request, response, next) => { 
    const body = request.body
    
    if (!body.name || !body.number){
        return response.status(400).json({
            error: 'name or number missing'
        })
    } 

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response,next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

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

/*let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"  
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]*/

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

app.get('/api/persons/:id', (request,response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request,response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
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

app.post('/api/persons', morganPost, (request, response) => { 
    const body = request.body
    
    if (!body.name || !body.number){
        return response.status(400).json({
            error: 'name or number missing'
        })
    } 

    /*const nameFound = persons.find(person => person.name === body.name)

    if (nameFound){
        return response.status(400).json({
            error: 'name is already in the phonebook'
        })
    }*/

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

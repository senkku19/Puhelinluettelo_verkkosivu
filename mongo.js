const mongoose = require('mongoose')

if (
  process.argv.length < 3 ||
    (process.argv.length > 3 && process.argv.length < 5)
) {
  console.log('give password as argument')
  process.exit(1)
}

const { 2: password, 3: name, 4: number } = process.argv

const url = `mongodb+srv://user:${password}@cluster0.h8xat.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => {
    const personSchema = new mongoose.Schema({
      name: String,
      number: String,
    })

    const Person = mongoose.model('Person', personSchema)

    if (name && number) {
      const person = new Person({
        name: name,
        number: number,
      })
      person.save().then((result) => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
      })
    } else {
      Person.find({}).then((result) => {
        console.log('phonebook:')
        result.forEach((p) => {
          console.log(`${p.name} ${p.number}`)
        })
        mongoose.connection.close()
      })
    }
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error)
  })
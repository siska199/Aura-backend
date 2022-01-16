require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router = require('./src/router/routes')
const path = require('path')
const app = express()

const dir = path.join(__dirname)
app.use(express.static(dir))
app.use(express.json())
app.use(cors())

app.use('/api/v1',router)


const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`App listen to port ${PORT}`)
})

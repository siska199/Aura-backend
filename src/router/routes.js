const express = require('express')

const router = express.Router()
const {register} = require('../controller/user')


router.post('/user', register)

module.exports = router
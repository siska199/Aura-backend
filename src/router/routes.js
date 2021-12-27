const express = require('express')

const router = express.Router()
const {register,login,getUsers, getUser, editUser,deleteUser,checkAuth} = require('../controller/user')


router.post('/user', register)

module.exports = router
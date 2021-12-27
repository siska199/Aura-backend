const express = require('express')
const router = express.Router()

const {register,login,getUsers, getUser, editUser,deleteUser,checkAuth} = require('../controller/user')
const {auth} = require('../middleware/auth')

router.post('/register', register)
router.post('/login', auth, login)
router.get('/user/:id', auth, getUser)
router.get('/check-auth',auth,checkAuth)
router.get('/users',auth, getUsers)
router.patch('user/:id',auth,editUser)
router.delete('/user/:id',auth,deleteUser)


module.exports = router
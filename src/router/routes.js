const express = require('express')
const router = express.Router()

const {register,login,getUsers, getUser, editUser,deleteUser,checkAuth} = require('../controller/user')
const {addCategory, getCategory, getCategories, editCategory, deleteCategory } = require('../controller/category')
const {addProduct,getProduct,getProducts,editProduct,deleteProduct} =  require('../controller/product')
const {addTransaction,getTransaction,getTransactions,editTransaction,deleteTransaction} =  require('../controller/transaction')
const {addWhishlist,getWhishlist,getWhishlists,editWhishlist,deleteWhishlist} =  require('../controller/whishlist')


const {auth} = require('../middleware/auth')
const {upload} = requier('../middleware/upload.js')

router.post('/register', register)
router.post('/login', auth, login)
router.get('/user/:id', auth, getUser)
router.get('/check-auth',auth,checkAuth)
router.get('/users',auth, getUsers)
router.patch('user/:id',upload('image'),auth,editUser)
router.delete('/user/:id',auth,deleteUser)

router.post('/category', addCategory)
router.get('/category/:id',auth, getCategory)
router.get('/categories',auth,getCategories)
router.patch('/category/:id',auth,editCategory)
router.delete('/category/:id',auth,deleteCategory)

router.post('/product', addProduct)
router.get('/product/:id',auth, getProduct)
router.get('/products',auth,getProducts)
router.patch('/product/:id',auth,editProduct)
router.delete('/product/:id',auth,deleteProduct)

router.post('/transaction', addTransaction)
router.get('/transaction/:id',auth, getTransaction)
router.get('/transactions',auth,getTransactions)
router.patch('/transaction/:id',auth,editTransaction)
router.delete('/transaction/:id',auth,deleteTransaction)

router.post('/whishlist', addWhishlist)
router.get('/whishlist/:id',auth, getWhishlist)
router.get('/whishlists',auth,getWhishlists)
router.patch('/whishlist/:id',auth,editWhishlist)
router.delete('/whishlist/:id',auth,deleteWhishlist)

module.exports = router
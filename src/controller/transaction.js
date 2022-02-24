const {transaction,product,user,category} = require('../../models')
const Joi = require('joi')
const cloudinary = require('../helper/cloudinary')

const categoryInformation = {
    model:category,
    as : 'category',
    attributes :{
        exclude :  ['id','createdAt','updatedAt']
    },
}

const productInformation  = {
    model : product,
    as : 'product',
    attributes :{
        exclude :  ['idcategory','idUser','createdAt','updatedAt']
    },
    include :categoryInformation
}

const userInformation = {
    model :user,
    as : 'user',
    attributes :{
        exclude:  ['password','id','status','fullName','email','phone','address','gender','image_public_id','createdAt','updatedAt']
    },
}

exports.addTransaction = async(req, res)=>{
    const schema = Joi.object({
        qty : Joi.number().required(),
        total : Joi.number().required(),
        idProduct : Joi.string().required(),
    })

    const {error} = schema.validate(req.body)
    if(error){
        return res.status(400).send({
            status : 'error',
            message : error.details[0].message.replace(/"/g,"")
        })
    }
    try {
        const checkUser = await user.findOne({
            where:{
                id : req.user.id,
                status : 'user'
            }
        })

        if(!checkUser){
            return res.status(400).send({
                status : 'failed',
                message : `Admin can't buy product`
            })
        }

        const findProduct = await product.findOne({
            where :{
                id : req.body.idProduct
            },
            raw : true
        }) 

        if(!findProduct){
            return res.status(400).send({
                status : 'error',
                message :'The product does not exist'
            })
        }

        const stock = findProduct.stock-req.body.qty

        await product.update({stock},{
            where :{
                id : req.body.idProduct
            }
        })

        const addTransaction = await transaction.create({
            ...req.body,
            status: 'Waiting Payment',
            idUser: req.user.id,
            idProduct : findProduct.id
        })

        const dataTransaction = await transaction.findOne({
            where:{
                id : addTransaction.id
            },
            include : [userInformation,productInformation],
            attributes:{
                exclude : ['createdAt','updatedAt'],
            },
        })

        return res.status(200).send({
            status: 'success',
            message :'Add transaction success',
            data : dataTransaction
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getTransaction = async(req, res)=>{
    try {
        console.log("Oke")
        const {id} = req.params

        const data = await transaction.findOne({
            where :{
                id
            },
            include : [userInformation,productInformation],
            attributes :{
                exclude : ['createdAt']
            }
        })

        return res.status(200).send({
            status : 'success',
            data 
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getTransactions = async(req, res)=>{
    try {
        console.log("status get transactions: ", req.query.status)
        const userData = await user.findOne({
            where :{
                id : req.user.id
            }
        })

        let data = await transaction.findAll({
            where :{
                status : req.query.status
            },
            include :[userInformation,productInformation],
        })

        if(userData.status=='user'){
            data = await transaction.findAll({
                where :{
                    status : req.query.status
                },
                include : [productInformation,{
                    model :user,
                    as : 'user',
                    attributes :{
                        exclude :  ['createdAt','updatedAt']
                    },
                    where : {
                        id : req.user.id
                    }
                }]
            })
        }
        console.log("Final data: ", data)
        return res.status(200).send({
            status : 'success',
            data
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.editTransaction = async(req,res)=>{
    try {
        console.log("id: ", req.params.id)
        const dataTransaction = await transaction.findOne({
            where:{
                id : req.params.id
            },
            include:[productInformation,userInformation],
            raw:true,
            nest:true
        })
        if(req.body.status=='Approve'){
            const stock = dataTransaction.product.stock-dataTransaction.qty
            await product.update(stock,{
                where :{
                    id :dataTransaction.idProduct
                }
            })       
        }

        const dataCategoryUpdated = await transaction.update(req.body,{
            where:{
                id : req.params.id
            }
        })

        return res.status(200).send({
            status : 'success',
            message : `Updated product with id: ${req.params.id} success`,
            data : dataCategoryUpdated 
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}


exports.deleteTransaction = async(req, res)=>{
    try {
        const {id} = req.params

        await transaction.destroy({
            where :{
                id
            }
        })
        return res.status(200).send({
            status : 'success',
            message : `Success delete transaction with id: ${id}`,
            
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}
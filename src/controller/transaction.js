const {transaction,product,user,category} = require('../../models')
const Joi = require('joi')
const cloudinary = require('../helper/cloudinary')

const categoryInformation = {
    model:category,
    as : 'category',
    attributes :{
        exclude :  ['createdAt','updatedAt']
    },
}

const productInformation  = {
    model : product,
    as : 'product',
    attributes :{
        exclude :  ['createdAt','updatedAt']
    },
    include :categoryInformation
}

const userInformation = {
    model :user,
    as : 'user',
    attributes :{
        exclude :  ['createdAt','updatedAt']
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
                message :'No product associate with this category'
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
            raw : true,
            nest : true
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

        let data = await transaction.findOne({
            where :{
                id
            },
            include : [userInformation,productInformation],
            raw :true,
            nest:true
        })

        let images = []
        for(file of JSON.parse(data.product.images)){
            console.log("file: ", file)
            images.push(cloudinary.url(file,{secure:true}))
        }
        data = {
            ...data,
            product : {
                ...data.product,
                images : images,
            }
        }

        console.log("Result data: ", data)
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
        const userData = await user.findOne({
            where :{
                id : req.user.id
            }
        })

        let data = await transaction.findAll({
            where :{
                status : 'Aprove' || 'Waiting Approve'
            },
            include :[userInformation,productInformation],

            raw : true,
            nest : true
        })

        if(userData.status=='user'){
            data = await transaction.findAll({
                include : [productInformation,{
                    model :user,
                    as : 'user',
                    attributes :{
                        exclude :  ['createdAt','updatedAt']
                    },
                    where : {
                        id : req.user.id
                    }
                }],
                raw : true,
                nest : true
            })
        }

        data = data.map(d=>{
            let images = []
            for(file of JSON.parse(d.product.images)){
                console.log("file: ", file)
                images.push(cloudinary.url(file,{secure:true}))
            }
            return({ 
                ...d,
                product : {
                    ...d.product,
                    images : images,
                }
            })
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

exports.editTransaction = async(req,res)=>{
    try {
        const dataTransaction = await transaction.findOne({
            where:{
                id : req.params.id
            },
            include:[productInformation,userInformation],
            raw:true,
            nest:true
        })

        let dataUpdated = {...req.body}
        if(req.body.status=='Waiting Approve'){
            const stock = dataTransaction.product.stock-dataTransaction.qty
            dataUpdated = {...dataUpdated,stock}
        }

        await product.update(dataUpdated,{
            where :{
                id : req.body.idProduct
            }
        })

        return res.status(200).send({
            status : 'success',
            message : `Updated product with id: ${req.params.id} success`,
            data : dataTransaction 
        })

    } catch (error) {
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
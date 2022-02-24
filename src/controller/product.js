const {product,category,user,comment,transaction} = require('../../models')
const Joi = require('joi')
const fs = require('fs')
const cloudinary = require('../helper/cloudinary')

const userInformation = {
    model : user,
    as : 'user',
    attributes :{
        exclude :  ['id','email','password','status','fullName','address','phone','gender','createdAt','updatedAt']
    },
}
const categoryInformation = {
    model : category,
    as : 'category',
    attributes :{
        exclude :  ['id','createdAt','updatedAt']
    }
}

const commentsInformation = {
    model : comment,
    as : 'comments',
    include : userInformation,
    attributes :{
        exclude :  ['id','idUser','idProduct','createdAt','updatedAt']
    }
}

const transactionInformation = {
    model : transaction,
    as : 'transactions',
    where :{
        status : 'Approve'
    },
    include:userInformation,
    attributes:{
        exclude :["createdAt", "updatedAt"]
    }
}
exports.addProduct = async(req, res)=>{
    const scheme = Joi.object({
        title:Joi.string(),
        review:Joi.string(),
        category: Joi.string(),
        price: Joi.number(),
        desc:Joi.string(),
        stock: Joi.number(),
        size:Joi.string(),
        color:Joi.string(),
    })

    const {images,...dataVal} = req.body
    const {error} = scheme.validate(dataVal)
    if(error){
        for (file of req.files){
            fs.unlinkSync('upload/product/'+file.filename)
        }
        return res.status(404).send({
            status: 'error',
            message: error.details[0].message.replace(/"/g,'')
        })
    }

    try {
        const userData = await user.findOne({
            where :{
                id : req.user.id,
                status : 'admin'
            }
        })
        if(!userData){
            res.status(403).send({
                status : 'forbidden',
                message : 'Forbidden to access'
            })
        }

        const findProduct = await product.findOne({
            where :{
                title : req.body.title
            }
        })

        if(findProduct){
            return res.status(400).send({
                status : 'failed',
                message : 'This product name has been existed'
            })
        }

        let findCategory = await category.findOne({
            where :{
                name : req.body.category
            }
        })

        if(!findCategory){
         findCategory =   await category.create({
                name : req.body.category
            })
        }

        let images_public_id = []
        let images = []
        for(file of req.files){
            const path = await cloudinary.uploader.upload(file.path,{
                folder :'product',
                use_filename : true,
                unique_filename: false
            })
            images_public_id.push(path.public_id)
            images.push(cloudinary.url(path.public_id,{secure:true}))
        }

        const dataProduct = await product.create({
            ...dataVal,
            stockFull:dataVal.stock,
            images_public_id : JSON.stringify(images_public_id),
            images : JSON.stringify(images),
            idCategory: findCategory.id,
            idUser: req.user.id
        })

        return res.status(200).send({
            status: 'success',
            message :'Add product success',
            data : dataProduct
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getProduct = async(req,res)=>{
    try {
        const dataProduct = await product.findOne({
            where :{
                id : req.params.id
            },
            attributes:{ 
                exclude :  ['idCategory','idUser','createdAt','updatedAt']
            },
            include : [categoryInformation,commentsInformation],
        })

        return res.status(200).send({
            status : 'success',
            message : 'Success get data product',
            data : dataProduct
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getProducts = async(req,res)=>{
    try {
        const page = req.query.page 

        let dataProducts = await product.findAll({
            include : [categoryInformation,commentsInformation],
            attributes :{
                exclude :  ['createdAt','updatedAt']
            },
        })

        if(page){
            dataProducts = dataProducts.splice(page-1,page*5)
        }

        return res.status(200).send({
            status:'success',
            data : dataProducts
        })

    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        }) 
    }
}

exports.editProduct = async(req, res)=>{
    try {
        let data = {...req.body}
        if(req.files){
            let images = []
            let images_public_id = []
            for(file of req.files){
                const path = await cloudinary.uploader.upload(file.path,{
                    folder:'product',
                    use_filename:true,
                    unique_filename:false
                })
                images.push(path.public_id)
                images_public_id.push(cloudinary.url(path.public_id,{secure:true}))
            }
            data = {
                ...data,
                images:JSON.stringify(images),
                images_public_id : JSON.stringify(images_public_id)
            }
            console.log("data: ", data)
        }

        if(req.body.category){
            let findCategory = await category.findOne({
                where:{
                    name : req.body.category
                }
            })
            if(!findCategory){
                findCategory = await category.create({
                    name : req.body.category
                })
            }
            data = {
                ...data,
                idCategory: findCategory.id
            }
        }

        await product.update(data,{
            where:{
                id : req.params.id
            }
        })

        const dataSended = await product.findOne({
            where:{
                id : req.params.id
            },
            include :[categoryInformation,commentsInformation],
            attributes :{
                exclude :  ['createdAt','updatedAt']
            },
        })

        return res.status(200).send({
            status : 'success',
            message : `Updated product with id: ${req.params.id} success`,
            data : dataSended 
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.deleteProduct = async (req, res)=>{
    try {
        const { id } = req.params
        const productData = await product.findOne({
            where :{id}
        })

        if(productData  && req.files){
            for (file of JSON.parse(productData.images_public_id)){
                await cloudinary.uploader.destroy(file,(result)=>console.log("Deleted :", result))
            }
        }

        await product.destroy({
            where :{
                id
            },
        })

        return res.status(200).send({
            status : 'success',
            message : `Succes delete product with id ${id}`,
            data : {
                id
            }
        }) 
    } catch (error) {
        return res.status(500).send({
            status: 'faild',
            message: error
        })
    }
}

exports.getProductTransactions = async(req, res)=>{
    try {
        let dataPT = await product.findAll({
            include :[categoryInformation,transactionInformation],
            attributes:{
                exclude :["createdAt", "updatedAt"]
            }
        })

        return res.status(200).send({
            status : 'success',
            data : dataPT
        })
    } catch (error) {
        return res.status(500).send({
            status: 'failed',
            message: error
        })
    }
}
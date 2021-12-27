const {product,category,user} = require('../../models/product')
const Joi = require('joi')
const fs = require('fs')
const { traceDeprecation } = require('process')
const { async } = require('q')
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
    console.log("Req.body: ",req.body)
    const {images,stockFull,...dataVal} = scheme.validate
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

        if(!findProduct){
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

        let images = []
        for(file of req.files){
            const path = await cloudinary.uplouder.uploud(file.path,{
                folder :'coolfash/product',
                use_filename : true,
                unique_filename: false
            })
            images.push(path.public_id)
        }

        const dataProduct = await product.create({
            ...dataAdded,
            images : JSON.stringify(images),
            idCategory: findCategory.id,
            idUser: req.user.id
        })

        return req.status(200).send({
            status: 'success',
            message :'Add product success',
            data : dataProduct
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getProduct = async(req,res)=>{
    try {
        let dataProduct = await product.findOne({
            where :{
                id : req.params.id
            },
            attributes:{
                exclude :  ['createdAt','updatedAt']
            },
            raw:true,

        })
        let images = []
        for(file of JSON.parse(dataProduct.images)){
            images.push(cloudinary.url(file.public_id,{secure:true}))
        }
        dataProduct ={
            ...dataProduct,
            images
        }

        return res.status(200).send({
            status : 'success',
            message : 'Success get data product',
            data : dataProduct
        })

    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getProducts = async(req,res)=>{
    try {
        let dataProducts = await traceDeprecation.findAll({
            include :{
                model :category,
                as : 'category',
                attributes :{
                    exclude :  ['createdAt','updatedAt']
                }
            },
            attributes :{
                exclude :  ['createdAt','updatedAt']
            },
            raw:true,
            nest:true
        })

        dataProducts = dataProducts.map(data=>{
            let images = []
            for(file of JSON.parse(data.images)){
                images.push(cloudinary.url(file))
            }

            return({
                ...data,
                images
            })
        })

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

exports.editTrip = async(req, res)=>{
    try {
        let data = {...req.body}
        if(req.files){
            let images = []
            for(file of req.files){
                const path = await cloudinary.uploader.upload(file.path,{
                    folder:'coolhash/product',
                    use_filename:true,
                    unique_filename:false
                })
                images.push(path.public_id)
            }
            data = {
                ...data,
                images,
            }
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
                id : req.params.id,
                include : {
                    model:category,
                    as : 'category'
                },
                attributes :{
                    exclude :  ['createdAt','updatedAt']
                },
                raw:true,
                nest:true
            }
        })
        return res.status(200).send({
            status : 'success',
            message : `Updated product with id: ${req.params.id} success`,
            data : dataSended 
        })

    } catch (error) {
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

            for (file of JSON.parse(productData.images)){
                await cloudinary.uploader.destroy(file,(result)=>console.log("Deleted :", result))
            }

        }

        await product.destroy({
            where :{
                id
            },
        })

        res.status(200).send({
            status : 'success',
            data : {
                id
            }
        }) 
    } catch (error) {
        res.status(500).send({
            status: 'faild',
            message: error
        })
    }
}

exports.getProductTransactions = (req, res)=>{
    try {
        let dataPT = await product.findAll({
            include :[
                {
                    model :category,
                    as : 'category',
                    attributes:{
                        exclude :["createdAt", "updatedAt"]
                    }
                },{
                    model : transaction,
                    as : 'transactions',
                    where :{
                        status : 'Approve'
                    },
                    attributes:{
                        exclude :["createdAt", "updatedAt"]
                    }
                }
            ],
            attributes:{
                exclude :["createdAt", "updatedAt"]
            },
            raw:true,
            nest:true
        })
        dataPT = dataPT.map(data=>{
            let images = []
            for (file of JSON.parse(data.images)){
                const path = cloudinary.url(file,{secure: true})
                images.push(path)
            }

            return({
                ...data,
                images: JSON.stringify(images)
            })

        })

        return res.status(200).send({
            status : 'success',
            data : dataPT
        })
    } catch (error) {
        res.status(500).send({
            status: 'faild',
            message: error
        })
    }
}
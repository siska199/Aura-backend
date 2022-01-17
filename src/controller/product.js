const {product,category,user,comment,transaction} = require('../../models')
const Joi = require('joi')
const fs = require('fs')
const cloudinary = require('../helper/cloudinary')

const categoryInformation = {
    model : category,
    as : 'category',
    attributes :{
        exclude :  ['createdAt','updatedAt']
    }
}

const commentsInformation = {
    model : comment,
    as : 'comments',
    include : {
        model : user,
        as : 'user',
        attributes :{
            exclude :  ['createdAt','updatedAt']
        },
    },
    attributes :{
        exclude :  ['createdAt','updatedAt']
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

    console.log("Req.body: ",req.body)

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

        let images = []
        for(file of req.files){
            const path = await cloudinary.uploader.upload(file.path,{
                folder :'product',
                use_filename : true,
                unique_filename: false
            })
            images.push(path.public_id)
        }
        console.log("dataVAl: ", dataVal)

        const dataProduct = await product.create({
            ...dataVal,
            stockFull:dataVal.stock,
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
        let dataProduct = await product.findOne({
            where :{
                id : req.params.id
            },
            attributes:{ 
                exclude :  ['createdAt','updatedAt']
            },
            include : [categoryInformation,commentsInformation],
            raw:true,
            nest : true

        })
        let images = []
        for(file of JSON.parse(dataProduct.images)){
            console.log("file: ", file)
            images.push(cloudinary.url(file,{secure:true}))
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
        const page = req.query.page 

        let dataProducts = await product.findAll({
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
                images.push(cloudinary.url(file, {secure:true}))
            }

            return({
                ...data,
                images
            })
        })

        if(page){
            dataProducts = dataProducts.splice(page-1,page*5)
            console.log("page pagination: ", page)
        }

        return res.status(200).send({
            status:'success',
            data : dataProducts
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        }) 
    }
}

exports.editProduct = async(req, res)=>{
    try {
        let data = {...req.body}
        console.log("req.files :",req.files)
        if(req.files){
            let images = []
            for(file of req.files){
                const path = await cloudinary.uploader.upload(file.path,{
                    folder:'product',
                    use_filename:true,
                    unique_filename:false
                })
                console.log("path ", path)
                images.push(path.public_id)
            }
            data = {
                ...data,
                images:JSON.stringify(images),
            }
            console.log("data: ", data)
        }

        if(req.body.category){
            console.log("req.body.category: ",req.body.category)
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
            raw:true,
            nest:true
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
            for (file of JSON.parse(productData.images)){
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
                    include:{
                        model : user,
                        as : 'user',
                        atrributes :{
                            exclude : ["password","createdAt", "updatedAt"]
                        }
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
        return res.status(500).send({
            status: 'faild',
            message: error
        })
    }
}
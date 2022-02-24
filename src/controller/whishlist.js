const {product, whishlist, user} = require('../../models')
const cloudinary = require('../helper/cloudinary')

const productInformation  = {
    model : product,
    as : 'product',
    attributes :{
        exclude :  ['createdAt','updatedAt']
    },
}
const userInformation  = {
    model : user,
    as : 'user',
    attributes :{
        exclude:  ['password','id','status','fullName','email','phone','address','gender','image_public_id','createdAt','updatedAt']
    },
}

exports.addRemoveWhishlist = async(req, res)=>{
    try {

        const dataUser = await user.findOne({
            where : {
                id : req.user.id,
                status : 'user'
            },
            attributes :{
                exclude : ['createdAt','updatedAt' ]
            },
            raw : true
        })

        if(!dataUser){
            return res.status(400).send({
                status : 'Failed',
                message:'Forbidden to access',
                data : dataSended
            })
        }
        const checkWhishlist = await whishlist.findOne({
            where :{
                idProduct : req.body.idProduct,
                idUser : req.user.id
            },
            attributes :{
                exclude : ['createdAt','updatedAt' ]
            },
            raw : true
        })

        if(checkWhishlist){
             await whishlist.destroy({
                where : {
                    id : checkWhishlist.id
                }
            })
            return res.status(200).send({
                status : 'success remove whishlist',
            })
        }else{
           await whishlist.create({
                love:true,
                idUser:req.user.id,
                idProduct: req.body.idProduct
            })
        }

        const dataSended = await whishlist.findOne({
            where :{
                idUser : req.user.id,
                idProduct : req.body.idProduct
            },
            attributes :{
                exclude : ['idProduct','idUser','createdAt','updatedAt']
            },
            include : [productInformation,userInformation],
            raw : true,
            nest : true
        })

        return res.status(200).send({
            status : 'success',
            data : dataSended
        })
    }catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }  
}

exports.getWhishlist = async (req,res)=>{
    try {
        const {id} = req.params

        let data = await whishlist.findOne({
            where:{
                id
            },
            include : [productInformation,userInformation],
            attributes :{
                exclude : ['createdAt','updatedAt']
            },
            raw : true,
            nest : true
        })
        let images = []
        for(file of JSON.parse(data.product.images)){
            images.push(cloudinary.url(file, {secure:true}))
        }
        data = {
            ...data,
            product : {
                ...data.product,
                images
            }
        }

        return res.status(200).send({
            status : 'success',
            message : `Success get whishlist with ${id}`,
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

exports.getWhishlists = async(req, res)=>{
    try {
        let data = await whishlist.findAll({
            where :{
                idUser : req.user.id
            },
            include: [productInformation,userInformation],
            attributes :{
                exclude : ['createdAt','updatedAt']
            },
            raw : true,
            nest :true
        })
        
        data.map(d=>{
            let images = []
            for(file of JSON.parse(d.product.images)){
                images.push(cloudinary.url(file.path,{secure:true}))
            }
            return({
                ...d,
                product : {
                    ...d.product,
                    images
                }
            })
        })

        return res.status(200).send({
            status : 'success',
            message : 'Success get All whishlists',
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

exports.editWhishlist = async(req, res)=>{
    try {
        const {id} = req.params

        await whishlist.update(req.body,{
            where :{
                id
            }
        })
        const data = await whishlist.findOne({
            where : {
                id
            },
            attributes : {
                exclude : ['createdAt', 'updatedAt']
            }
        })
        return res.status(200).send({
            status : 'success',
            message : `Success edit whishlist with id: ${id}`,
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

exports.deleteWhishlist = async(req, res)=>{
    try {
        const {id} = req.params

        await whishlist.destroy({
            where :{
                id
            }
        })
        return res.status(200).send({
            status : 'success',
            message : `Success delete whishlist with id: ${id}`,
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}
const {product, whishlist} = require('../../models')

const productInformation  = {
    model : product,
    as : 'product',
    attributes :{
        exclude :  ['createdAt','updatedAt']
    },
}

exports.addWhishlist = async(req, res)=>{
    try {

        const data = await whishlist.create({
            love:true,
            idUser:req.user.id,
            idProduct: req.body.idProduct
        })
        return res.status(200).send({
            status : 'success',
            message:'success add whishlist',
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }

}

exports.getWhishlist = async (req,res)=>{
    try {
        const {id} = req.params

        const data = await whishlist.findOne({
            where:{
                id
            },
            include:productInformation ,
            attributes :{
                exclude : ['createdAt','updatedAt']
            }   
        })

        return res.status(200).send({
            status : 'success',
            message : `Success get whishlist with ${id}`,
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getWhishlists = async(req, res)=>{
    try {
        const data = await whishlist.findAll({
            where :{
                idUser : req.user.id
            },
            include: productInformation,
            attributes :{
                exclude : ['createdAt','updatedAt']
            }   
        })
        
        return res.status(200).send({
            status : 'success',
            message : `Success get whishlists with ${id}`,
            data
        })
    } catch (error) {
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
        return res.status(200).send({
            status : 'success',
            message : `Success edit whishlist with id: ${id}`,
            data
        })
    } catch (error) {
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
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}
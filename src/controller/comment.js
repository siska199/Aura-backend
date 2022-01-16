const {user, product, comment} = require('../../models')

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
        exclude :  ['createdAt','updatedAt']
    },
}


exports.addComment = async(req, res)=>{
    try {

        const data = await comment.create({
            comment:req.body.comment,
            idUser:req.user.id,
            idProduct: req.body.idProduct
        })

        return res.status(200).send({
            status : 'success',
            message:'success add comment',
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getComment = async (req,res)=>{
    try {
        const {id} = req.params

        const data = await comment.findOne({
            where:{
                id
            },
            include: [productInformation,userInformation],
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

exports.getComments = async(req, res)=>{
    try {
        const data = await comment.findAll({
            where :{
                idUser : req.user.id
            },
            include:  [productInformation,userInformation],
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

exports.editComment = async(req, res)=>{
    try {
        const {id} = req.params

        await comment.update(req.body,{
            where :{
                id
            }
        })
        return res.status(200).send({
            status : 'success',
            message : `Success edit comment with id: ${id}`,
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.deleteComment = async(req, res)=>{
    try {
        const {id} = req.params

        await comment.destroy({
            where :{
                id
            }
        })
        return res.status(200).send({
            status : 'success',
            message : `Success delete comment with id: ${id}`,
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}
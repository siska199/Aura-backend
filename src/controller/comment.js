const {comment} = require('../../models')


exports.addComment = async(req, res)=>{
    try {
        const data = await comment.create({
            comment:req.body.comment,
            idUser:req.user.id,
            idProduct: req.body.idProduct,
        })

        return res.status(200).send({
            status : 'success',
            message:'success add comment',
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

exports.getComment = async (req,res)=>{
    try {
        const {id} = req.params

        const data = await comment.findOne({
            where:{
                id
            },
            attributes :{
                exclude : ['createdAt','updatedAt']
            },
        })

        return res.status(200).send({
            status : 'success',
            message : `Success get comment with ${id}`,
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
            attributes :{
                exclude : ['createdAt','updatedAt']
            },
        })
        
        return res.status(200).send({
            status : 'success',
            message : 'Success get comments',
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
        })
    } catch (error) {
        console.log(error)
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
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}
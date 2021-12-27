const {category, user} = require('../../models/category')
const Joi = require('joi')

exports.addCategory = async(req, res)=>{
    const schema = Joi.object({
        name : Joi.string().required()
    })

    const {error} = schema.validate(req.body)
    if(error){
        res.status(400).send({
            status : 'error',
            message : error.details[0].message.replace(/"/g,"")
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
            return res.status(403).send({
                status : 'forbidden',
                message : 'Forbidden to access'
            })
        }
        const data = await category.create(req.body)
        return res.status(200).send({
            status : 'success',
            message:'success add category',
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }

}

exports.getCategory = async (req,res)=>{
    try {
        const {id} = req.params

        const data = await category.findOne({
            where:{
                id
            },
            attributes :{
                exclude : ['createdAt','updatedAt']
            }   
        })

        return res.status(200).send({
            status : 'success',
            message : `Success get category with ${id}`,
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getCategories = async(req, res)=>{
    try {
        const data = await category.findAll({
            attributes :{
                exclude : ['createdAt','updatedAt']
            }   
        })
        
        return res.status(200).send({
            status : 'success',
            message : `Success get categories with ${id}`,
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.editCategory = async(req, res)=>{
    try {
        const {id} = req.params

        await category.update(req.body,{
            where :{
                id
            }
        })
        return res.status(200).send({
            status : 'success',
            message : `Success edit category with id: ${id}`,
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.deleteCategory = async(req, res)=>{
    try {
        const {id} = req.params

        await category.destroy({
            where :{
                id
            }
        })
        return res.status(200).send({
            status : 'success',
            message : `Success delete category with id: ${id}`,
            data
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}
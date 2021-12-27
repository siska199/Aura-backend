const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('../helper/cloudinary')
const {user} =require('../../models')

exports.register = async(req, res)=>{

    const scheme = Joi.object({
        email : Joi.string().required().email(),
        password : Joi.string().min(8).max(100).alphanum().required(),
        username :  Joi.string().min(3).required()
    })

    const {error} = scheme.validate(req.body)
    if(error){
       return res.status(400).send({
            status : 'error',
            message : error.details[0].message.replace(/"/g,"")
        })
    }

    try {
        const matchEmail = await user.findOne({
            where:{
                email : req.body.email
            }
        })
        const matchUsername = await user.findOne({
            where:{
                username : req.body.username
            }
        })

        if(matchEmail){
            return res.status(404).send({
                status : 'error',
                message : 'This email has been registered'
            })
        }

        if(matchUsername){
            return res.status(404).send({
                status : 'error',
                message : 'This username has been used'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)

        const addUser = await user.create({
            ...req.body,
            password:  hashedPassword,
            status:'user',
            fullName: '',
            address: '',
            phone: 0,
            gender: '',
            image : 'coolfash/avatar/defualt_profile_coolfash_user.png',

        })
        const token = jwt.sign({id:addUser.id},process.env.TOKEN_USER)
        res.status(200).send({
            status : 'success',
            data :{
                email : addUser.email,
                token 
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.login = async(req, res)=>{

    const scheme = Joi.object({
        password : Joi.string().min(8).max(100).alphanum().required(),
        username :  Joi.string().min(3).required()   
    })

    const {error} = scheme.validate(req.body)

    if(error){
        return res.status(404).send({
            status : 'error',
            message : error.details[0].message.replace(/"/g,"")
        })
    }

    try {
        const findUser = await user.findOne({
            where:{
                email : req.body.username
            },
            attributes :{
                exclude : ['createdAt','updatedAt','password']
            }       
        })

        console.log("Data finduser: ", findUser)

        if(!findUser){
            return res.status(404).send({
                status : 'failed',
                message: 'Username or password is wrong'
            })
        }

        const isPassword = await bcrypt.compare(req.body.password,findUser.password)
        if(!isPassword){
            return res.status(404).send({
                status : 'failed',
                message: 'Username or password is wrong'
            })
        }
        const token = jwt.sign({id:findUser.id},process.env.TOKEN_USER)
        return res.status(200).send({
            status : 'success',
            message : 'Login success',
            data :{
                ...findUser,
                token
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getUsers = async(req,res)=>{
    try {
        const findUser = await findOne({
            where:{
                id : req.user.id,
                status: 'admin'
            }
        })

        if(!findUser){
            res.status(403).send({
                status : 'forbidden',
                message : 'Forbidden to access'
            })
        }

        let dataUsers = await user.findAll({
            attributes :{
                exclude : ['createdAt','updatedAt','password']
            },
            raw : true,
        })

        dataUsers = dataUsers.map(data=>{
            return({
                ...data,
                image: cloudinary.url(data.iamge,{secure:true})
            })
        })

        res.status(200).send({
            status: 'success',
            data : dataUsers
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.getUser = async (req, res)=>{
    try {
        let dataUser = await user.findOne({
            where : {
                id : req.user.id
            },
            attributes:{
                exclude : ['createdAt','updatedAt','password']
            },
            raw: true
        })
        dataUser = dataUser.map(data=>{
            return{
                ...data,
                image : cloudinary.url(data.image)
            }
        })
        res.status(200).send({
            status : 'success',
            data : dataUser
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.editUser = async(req,res)=>{
    try {
        let dataEdited

        if(req.file){
            const dataUser = await user.findOne({
                where :{
                    id : req.user.id
                },
                raw : true
            })

            if(dataUser.image.match(/coolfash\/avatar\/defualt_profile_coolfash_user.png/g)){
                await cloudinary.uploader.destroy(dataUser.image,(res)=>console.log(res))
                // fs.unlinkSync( path )
            }

            const imagePath = await cloudinary.uploader.upload(req.file.path,{
                folder : 'coolfash/profile',
                use_filename: true,
                unique_filename : false
            })
            dataEdited ={
                ...req.body,
                image : imagePath
            }
        }else{
            dataEdited ={
                ...req.body,
            }
        }

        await user.update(dataEdited,{
            where :{
                id : req.user.id
            }
        })
        res.status(200).send({
            status: 'success',
            message : 'Success update user data',
            data : {
                id : req.user.id
            }
        })

    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.deleteUser = async()=>{
    try {
        const findData = await user.findOne({
            where :{
                id : req.user.id,
                status : 'admin'
            }
        })

        if(!findData){
            return res.status(500).send({
                status : 'forbidden',
                message : 'Forbidden to access'
            })
        }


        if(findData.image.match(/coolfash\/avatar\/defualt_profile_coolfash_user.png/g)){
            await cloudinary.uploader.destroy(findData.image,{secure:true})
        }

        await user.destroy({
            where :{
                id : req.user.id
            }
        })
        return res.code(201).send({
            status : 'success',
            message : 'Delete user success',
            data : {
                id : req.user.id
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}

exports.checkAuth = async (req, res)=>{
    try {
        
        const dataUser = await user.findOne({
            where :{
                id : req.user.id
            },
            attributes :{
                exclude : ["createdAt", "updatedAt", "password"]
            }
        })

        if(!dataUser){
            res.code(404).send({
                status : 'failed',
            })
        }

        res.code(200).send({
            status : 'success',
            data :{
                ...dataUser,
                image : cloudinary.url(dataUser.image,{secure:true})
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}
const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('../helper/cloudinary')
const {user} =require('../../models')
const fs = require('fs')
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
            image : 'avatar/defualt.png',

        })
        const token = jwt.sign({id:addUser.id},process.env.TOKEN_USER)
        return res.status(200).send({
            status : 'success',
            data :{
                email : addUser.email,
                token 
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : String(error)
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
                username : req.body.username
            },
            attributes :{
                exclude : ['createdAt','updatedAt' ]
            },
            raw:true       
        })


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
                image : cloudinary.url(findUser.image,{secure:true}),
                password : "forbidden to access",
                token,

            }
        })

    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : String(error)
        })
    }
}

exports.getUsers = async(req,res)=>{
    try {
        const findUser = await user.findOne({
            where:{
                id : req.user.id,
                status: 'admin'
            }
        })

        if(!findUser){
           return  res.status(403).send({
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
              image : cloudinary.url(data.image,{secure:true})

            })
        })

        res.status(200).send({
            status: 'success',
            data : dataUsers
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : String(error)
        })
    }
}

exports.getUser = async (req, res)=>{
    try {

        const dataUser = await user.findOne({
            where : {
                id : req.params.id
            },
            attributes:{
                exclude : ['createdAt','updatedAt','password']
            },
            raw: true
        })

        return res.status(200).send({
            status : 'success',
            data : {
                ...dataUser,
                image : cloudinary.url(dataUser.image,{secure:true})
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : String(error)
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
            const check = dataUser.image.match(/defualt.png/g)

            if(check==null){
                await cloudinary.uploader.destroy(dataUser.image,(res)=>console.log(res))
                console.log("Req file path: ",req.file.path)
                // fs.unlinkSync('upload/product/'+file.filename)
            }

            const imagePath = await cloudinary.uploader.upload(req.file.path,{
                folder : 'avatar',
                use_filename: true,
                unique_filename : false
            })

            console.log("imagePath: ", imagePath)
            console.log("imagePath.public_id: ",imagePath.public_id)
            
            dataEdited ={
                ...req.body,
                image : imagePath.public_id
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
        return res.status(200).send({
            status: 'success',
            message : 'Success update user data',
            data : {
                id : req.user.id
            }
        })

    } catch (error) {
        console.log(error)
        if(req.file){
            fs.unlinkSync(req.file.path)
        }
        return res.status(500).send({
            status : 'error',
            message : String(error)
        })
    }
}

exports.deleteUser = async(req,res)=>{
    try {
        const findData = await user.findOne({
            where :{
                id : req.user.id,
            }
        })

        if(findData.image.match(/avatar\/defualt.png/g)){
            const urlPhoto = cloudinary.url(findData.image)
            console.log("findData: ",urlPhoto)

            // fs.unlinkSync('upload/avatar/')

            await cloudinary.uploader.destroy(findData.image,{secure:true})
        }

        await user.destroy({
            where :{
                id : req.user.id
            }
        })
        return res.status(201).send({
            status : 'success',
            message : 'Delete user success',
            data : {
                id : req.user.id
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : String(error)
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

        return res.status(200).send({
            status : 'success',
            data :{
                ...dataUser,
                password : "Access denied",
                image : cloudinary.url(dataUser.image,{secure:true})
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : String(error)
        })
    }
}
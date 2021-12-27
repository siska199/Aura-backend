const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {user} =require('../../models')

exports.register = async(req, res)=>{

    const scheme = Joi.object({
        email : Joi.string().required().email(),
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

        const randomName = Math.floor(Math.random()*8);
        console.log("randomName: ", randomName)
        const pathAvatar = `coolfash/avatar/${randomName}.png`

        const addUser = await user.create({
            ...req.body,
            password:  hashedPassword,
            status:'user',
            fullName: '',
            address: '',
            phone: 0,
            gender: '',
            image : pathAvatar,

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
                message : 'Token is invalid'
            })
        }

        const dataUsers = await user.findAll({
            attributes :{
                exclude : ['createdAt','updatedAt','password']
            },
            raw : true,
        })

    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}
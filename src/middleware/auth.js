const jwt = require('jsonwebtoken')

exports.auth = (req, res,next)=>{
    const autoHeader = req.header('Authorization')
    console.log("autoHeader: ", autoHeader)
    const token = autoHeader && autoHeader.split(' ')[1]

    if(!token){
        return res.status(401).send({
            message: 'Access denied'
        })
    }
    try {
        const verify = jwt.verify(token,process.env.TOKEN_USER)
        req.user = verify
        next()
    } catch (error) {
        res.status(400).send({
            message : 'Invalid token'
        })
    }
}
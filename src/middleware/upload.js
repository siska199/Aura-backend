const multer = require('multer')

exports.upload = (image)=>{
    console.log("file masuk: ", image)
    const storage = multer.diskStorage({
        destination : function(req,file,cb){
            if(image=='images'){
                cb(null,'upload/product')
            }else if(image=='image'){
                cb(null,'upload/avatar')
            }
        },
        filename : function(req, file,cb){
            cb(null,Date.now()+'-'+file.originalname.replace(/\s/g,''))
        }
    })

    const fileFilter = function(req, file, cb){
        console.log("file dari fileFilter :",file)
        if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)/)){
            req.fileValidationError = {
                message : 'Only image file are allowed'
            }
            return cb(new Error('Only image files are alllowed'), false)
        }
        cb(null, true)
    }

    const sizeInMB = 10;
    const maxSize = sizeInMB*1000*1000

    let upload
    if(image=='image'){
        upload = multer({
            storage,
            fileFilter,
            limits :{
                fileSize : maxSize
            }
        }).single(image)
    }
    if(image=='images'){
        upload = multer({
            storage,
            fileFilter,
            limits:{
                fileSize:maxSize
            }
        }).array(image,7)
    }

    return(req, res, next)=>{
        upload(req, res, function(err){
            if(req.fileValidationError){
                return res.status(400).send(req.fileValidationError)
            }

            if(!err){
                if(!image=='images' && !req.files){
                    return res.status(400).send({
                        message: 'Please select files to uploud'
                    })
                }

                if(!image=='image' && !req.file){
                    return res.status(400).send({
                        message: 'Please select file to uploud'
                    })
                }
            }

            if(err){
                if(err.code=="LIMIT_FILE_SIZE"){
                    return res.status(400).send({
                        message: 'Max file sized 10MB'
                    })
                }
                return res.status(400).send(err)
            }
            return next()
        })
    }
}
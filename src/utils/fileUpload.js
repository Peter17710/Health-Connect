import mongoose from "mongoose" ;
import appError from "./appError.js";
import multer from "multer";

    const uploadFile = () =>{
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
              cb(null, 'uploads')
            },
            filename: function (req, file, cb) {
              cb(null, new mongoose.Types.ObjectId +'_'+ file.originalname )
            }
          })

          function fileFilter (req, file, cb) {

            // The function should call `cb` with a boolean
            // to indicate if the file should be accepted                           
            if(file.mimetype.startsWith("image")){
                cb(null, true) 
            }else{
                cb(new appError("invalid image type",401), false)
            }
            // To reject this file pass `false`, like so:
          
            // To accept the file pass `true`, like so:
          
            // You can always pass an error if something goes wrong:
          
          }
          
          const upload = multer({ storage: storage , fileFilter })
          return upload ;
    }

    export const uploadSingle = (fieldname) => uploadFile().single(fieldname) ;
    export const uploadArray = (fieldname) => uploadFile().array(fieldname,10 ) ;
    export const uploadFields = (fieldname) => uploadFile().fields(fieldname) ;
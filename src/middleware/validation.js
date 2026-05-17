const validate = (schema) => {

    return (req, res, next) => {

        let filters = {}
        if(req.file){
            filters = {image: req.file, ...req.body , ...req.params , ...req.query}
        }else if(req.files){
            filters = {...req.files , ...req.body , ...req.params , ...req.query}
        }else{
            filters = {...req.body , ...req.body , ...req.params , ...req.query}
        }
        let { error } = schema.validate(req.body, { abortEarly: false })
        if (!error) {
            next()
        } else {
            res.json({ message: error.details })
        }
    }
}
export default validate ;
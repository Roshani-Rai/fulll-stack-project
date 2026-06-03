import jwt from 'jsonwebtoken'

const authUser = async(req,res,next)=>{
    try {
        const {token}=req.headers
        if(!token){
            return res.json({success:false,message:'Not Authorized login again'})
        }
        const token_decode=jwt.verify(token,process.env.JWT_SECRET);
        req.user = { userId: token_decode.id }
        next()

    } catch (error) {
        console.log(error)
        res.json({successs:false,message:error.message})
    }

}
 export default authUser
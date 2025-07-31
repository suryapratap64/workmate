import mongoose from 'mongoose';
const workerSchema=new mongoose.Schema({
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    mobileNumber:{type:String,required:true},
    // email:{type:string,required:true},
    password:{type:String,required:true},
    // profilePicture:{type:String,default:''},
    // bio:{type:String,enum:['male','female']},
    country:{type :String,required:true},
    // city:{type:string,default:''},
    state:{type:String,default:''},
    localAddress:{type:String,default:''}
   





},
{timestamps:true}
)
export const Worker=mongoose.model('Worker',workerSchema);
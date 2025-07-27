require('dotenv').config();

const mongoose=require("mongoose")
mongoose.set('strictQuery', false)


function connectDB() {
    mongoose.connect(  process.env.MONGO_CONNECTION_URL);


    const connection=mongoose.connection;


    try{
        
        connection.once('open', ()=>{
            console.log('Database Connected')
        })
    }
    catch(err)
    {
        console.log(err)
    }
}

module.exports=connectDB

//user.model.js
import mongoose from "mongoose";

//Definimos el esquema : "schema". 
//El "schema" es un objeto que nos permite definir la forma de los documentos. Configuramos el nombre de los campos y los tipos de datos que almacenarán . 

const usersSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },

    last_name: {
        type: String,
        //required: true
    },

    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },

    password: {
        type: String,
        //required: true
    },

    age: {
        type: Number,
        //required: true
    },
    role: {
        type: String,
        enum: ['admin', 'usuario', 'premium'],
        default: 'usuario'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    resetToken:{
        token: String,
        expire: Date
    },
    documents: [{
        name: String,
        reference: String
    }], 

    last_connection: {
        type: Date, 
        default: Date.now
    }
});



//Difinir el modelo: 

const UsersModel = mongoose.model("users", usersSchema);

export default UsersModel;


//src/config/config.js

//Instalamos una dependencia para manejar las variables de entorno: 
//npm i dotenv

import dotenv from "dotenv";
import program from "../utils/commander.js"; 

const { mode } = program.opts(); 

dotenv.config({
    path: mode === "produccion" ? "./.env.produccion":"./.env.desarrollo"
});


const configObject = {
    puerto: process.env.PUERTO || process.env.PORT || 8080,
    mongo_url: process.env.MONGO_URL
}

export default configObject;
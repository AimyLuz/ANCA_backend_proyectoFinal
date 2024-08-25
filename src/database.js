//database.js

//Nos conectamos a MongoAtlas por medio de mongoose: 
import configObject from "./config/config.js";
import mongoose from "mongoose";
import { addLogger, logger } from "./utils/logger.js";


class BaseDatos {
  static #instancia; 
  //Se declara una variable estatica y privada llamada "instancia". 
  constructor(){
      mongoose.connect(configObject.mongo_url);
  }

  static getInstancia() {
      if(this.#instancia) {
          logger.warn("Conexion previa");
          return this.#instancia;
      }

      this.#instancia = new BaseDatos(); 
      logger.info("Conexion exitosa");
      return this.#instancia;
  }
}

export default BaseDatos.getInstancia();
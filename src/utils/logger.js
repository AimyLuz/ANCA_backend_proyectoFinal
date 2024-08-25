import winston from "winston";
import configObject from "../config/config.js";


//colores lindos 
const niveles = {
    nivel: {
        fatal: 0,
        error: 1,
        warning: 2, 
        info: 3, 
        http: 4, 
        debug: 5
    }, 
    colores: {
        fatal: "red", 
        error: "yellow",
        warning: "blue", 
        info: "green", 
        http: "magenta", 
        debug: "white"
    }
}


//Logger para desarrollo: 

const loggerDesarrollo = winston.createLogger({
    levels: niveles.nivel, 
    transports: [
        new winston.transports.Console({
            level: "debug",
            format: winston.format.combine(
                winston.format.colorize({colors: niveles.colores}),
                winston.format.simple()
            )
        })
    ]
})

//Logger para produccion: 

const loggerProduccion = winston.createLogger({
    levels: niveles.nivel, 
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({colors: niveles.colores}),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: './errors.log',
            level: 'error', // Este nivel asegura que sólo se loguean errores y niveles superiores
            format: winston.format.simple()
})
    ]
})


//Determinar que logger usar de acuerdo a la variable de entorno (.env). 
//Pueden usar un ternario: 

const logger = configObject.node_env === "produccion" ? loggerProduccion : loggerDesarrollo;








//creamos un middleware

const addLogger = (req, res, next)=>{
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`);
    next();
}

export { addLogger, logger };
//app.js
import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';
import LocalStrategy from 'passport-local';
import { Server } from 'socket.io';
import './database.js';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import viewsRouter from './routes/views.router.js';
import userRouter from './routes/user.router.js';
//import sessionRouter from './routes/session.router.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import mongoose from 'mongoose';
import configObject from './config/config.js';
import cors from 'cors';
//import authMiddleware from './middleware/authmiddleware.js';
import UsersModel from './models/users.model.js';
import MessageModel from './models/mesagge.model.js';
import MongoStore from "connect-mongo";
const app = express();
const { mongo_url, puerto } = configObject;
import cookieParser from 'cookie-parser';
import compression from "express-compression"; 
import { errorHandler } from './middleware/errorHandler.js';
import { addLogger, logger } from './utils/logger.js';

import config from './config/config.js';
//desafio clase 39
import swaggerUiExpress from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import SocketManager from './sockets/socketmanager.js'; // Asegúrate de importar correctamente




const swaggerOptions ={
    definition:{
        openapi: "3.0.1",
        info: {
            title: "Documentacion de la app ArrabalMusicStore",
            description: "Proyecto final Backend Coderhouse 2024. Ayelén Anca"
        }
    },
    apis: ['./src/docs/**/*.yaml']
}

const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));



// Middleware


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials:true
}));
app.use(addLogger);
//GZIP: 
app.use(compression());
// Configuración de express-session
app.use(session({
    store: MongoStore.create({ mongoUrl: mongo_url, ttl: 86400 }),
    secret: "secretCoder",
    resave: true,
    saveUninitialized: true,
}));

// Manejo de errores
app.use(errorHandler);

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());
  initializePassport();
  
// Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/", viewsRouter);


//rutas para testear
app.get("/loggertest", (req,res)=>{
    req.logger.http("Mensaje HTTP");
    req.logger.info("Mensaje INFO");
    req.logger.warning("Mensaje WARN");
    req.logger.error("Mensaje ERROR");

    res.send("Logs generados");
})
app.get('/pruebas', async (req, res) => {
    try {
        const usuarios = await UsersModel.find();
        req.logger.info("Usuarios obtenidos exitosamente");
        res.send(usuarios);
    } catch (error) {
        req.logger.error("Error al obtener usuarios: " + error.message);
        res.status(500).send('Error de servidor');
    }
});

// Conexión a MongoDB
mongoose.connect(config.mongo_url)
    .then(() => {
        logger.info('Conectados a la BD');
    })
    .catch(() => 
    {
        logger.error('Error al conectar a la BD: ' + error.message);
    }
    );

// Inicialización del servidor
const httpServer = app.listen(puerto, () => {
    logger.info(`Escuchando en el puerto: ${puerto}`);
});

// Inicialización de SocketManager para manejo de sockets
new SocketManager(httpServer);



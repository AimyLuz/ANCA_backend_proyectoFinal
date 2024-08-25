//src/sockets/socketmanager.js
import { Server } from "socket.io";
import ProductRepository from "../repositories/products.repository.js";
import MessageModel from "../models/mesagge.model.js";

const productRepository = new ProductRepository();

class SocketManager {
    constructor(httpServer) {
        this.io = new Server(httpServer);
        this.initSocketEvents();
    }

    initSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Un cliente se conectó");

            // Emite la lista de productos actualizada cuando un cliente se conecta
            socket.emit("productos", await productRepository.getProducts({}, { limit: 100 }));

            socket.on("eliminarProducto", async (id) => {
                await productRepository.deleteProduct(id);
                this.emitUpdatedProducts();
            });

            socket.on("agregarProducto", async (producto) => {  // Asegúrate de que este nombre coincida
                try {
                    await productRepository.addProduct(producto);
                    this.emitUpdatedProducts();
                    socket.emit('success');  // Envía un evento de éxito al cliente
                } catch (error) {
                    socket.emit('error');  // Envía un evento de error al cliente
                }
            });

                    // Manejo del chat
            socket.on("message", async (data) => {
            console.log("Mensaje recibido:", data); // Verificar datos
            await MessageModel.create(data);
            const messages = await MessageModel.find();
            this.io.emit("messagesLogs", messages); // Emitir mensajes actualizados
        });
        });
    }

    async emitUpdatedProducts() {
        this.io.emit("productos", await productRepository.getProducts({}, { limit: 100 }));
    }
}

export default SocketManager;

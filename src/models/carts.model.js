//carts.models.js
import mongoose from "mongoose";
const cartsSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: "products",
                required: true
            },
            quantity: {
                type:Number, 
                required: true
            }
        }
    ]
});
// Middleware pre que realiza la población automáticamente
cartsSchema.pre('findOne', function (next) {
    this.populate('products.product', '_id title price');
    next();
  });
  

const CartsModel = mongoose.model("carts", cartsSchema);

export default CartsModel;
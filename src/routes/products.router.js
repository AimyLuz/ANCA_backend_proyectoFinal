import express from "express";
import ProductsController from "../controllers/products.controller.js";
const pc = new ProductsController();
const router = express.Router();

router.get("/", pc.getProductsApi);
router.get("/:pid", pc.getProductById);
router.post("/", pc.addProduct);
router.put("/:pid", pc.updateProduct);
router.delete("/:pid", pc.deleteProduct);

export default router;
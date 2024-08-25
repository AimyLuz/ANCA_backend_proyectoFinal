// src/middleware/errorHandler.js

import { ERROR_TYPES } from "../utils/errorDirectory.js";

export function errorHandler(err, req, res, next) {
    console.error(err);

    switch (err.type) {
        case ERROR_TYPES.MISSING_REQUIRED_FIELDS:
            return res.status(400).json({ status: "error", error: err.message, details: err.details });
        case ERROR_TYPES.PRODUCT_NOT_FOUND:
            return res.status(404).json({ status: "error", error: err.message });
        case ERROR_TYPES.SERVER_ERROR:
        default:
            return res.status(500).json({ status: "error", error: "Error interno del servidor" });
    }
}
export const ERROR_TYPES = {
    MISSING_REQUIRED_FIELDS: "MISSING_REQUIRED_FIELDS",
    PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
    SERVER_ERROR: "SERVER_ERROR",
    CART_NOT_FOUND: "CART_NOT_FOUND",
    PRODUCT_OUT_OF_STOCK: "PRODUCT_OUT_OF_STOCK",
    CART_EMPTY: "CART_EMPTY",
};

export function createError(type, message, details = {}) {
    const error = new Error(message);
    error.type = type;
    error.details = details;
    return error;
}
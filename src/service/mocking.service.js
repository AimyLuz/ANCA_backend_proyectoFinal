import { faker } from '@faker-js/faker';

class MockingService {
    generateMockProducts() {
        const products = [];
        for (let i = 0; i < 100; i++) {
            const product = {
                _id: faker.database.mongodbObjectId(),
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                code: faker.random.alphaNumeric(8), // Genera una cadena alfanumérica de longitud 8
                price: faker.commerce.price(),
                status: faker.datatype.boolean(),
                stock: faker.number.int({ min: 0, max: 100 }), 
                category: faker.commerce.department(),
                thumbnails: [faker.image.url()]
            };
            products.push(product);
        }
        return products;
    }
}

export default new MockingService();
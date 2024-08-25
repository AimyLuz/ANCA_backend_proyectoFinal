import UserDTO from "../dto/user.dto.js";
import userDAO from "../dao/userDAO.js";

class UserRepository {
    async getAll() {
        const users = await userDAO.getAll();
        return users.map(user => new UserDTO(user));
    }

    async getById(id) {
        const user = await userDAO.getById(id);
        return user ? new UserDTO(user) : null;
    }
    async create(user) {
        const newUser = await userDAO.create(user);
        return new UserDTO(newUser);
    }

    async update(id, user) {
        const updatedUser = await userDAO.update(id, user);
        return new UserDTO(updatedUser);
    }

    async delete(id) {
        return await userDAO.delete(id);
    }
    async findByEmail(email) {
        const user = await userDAO.findByEmail(email);
        return user ? new UserDTO(user) : null;
    }
}

export default UserRepository;
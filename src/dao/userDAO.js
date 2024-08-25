import UsersModel from '../models/users.model.js';

class UserDAO {
    async getAll() {
        return await UsersModel.find();
    }

    async getById(id) {
        return await UsersModel.findById(id);
    }

    async create(user) {
        const newUser = new UsersModel(user);
        return await newUser.save();
    }

    async update(id, user) {
        return await UsersModel.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id) {
        return await UsersModel.findByIdAndDelete(id);
    }
    async findByEmail(email) {
        return await UsersModel.findOne({ email });
    }
    
}

export default new UserDAO();
//user.dto.js
class UserDTO {
    constructor(user) {
        this._id = user._id;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.role = user.role;
        this.email = user.email;
        this.age = user.age;
        this.cart = user.cart;
        this.resetToken = user.resetToken;
        this.documents = user.documents;
        this.last_connection = user.last_connection;
    }
}

export default UserDTO;

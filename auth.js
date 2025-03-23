const fs = require('fs-extra');
class Auth {
    constructor() {
        this.users = fs.readJsonSync('users.json', { throws: false }) || [];
    }
    validateUser(id,username, password) {
        return this.users.find((user) => user.id === id && user.username === username && user.password === password);
    }
    addUser(user) {
        const userAlreadyPresent = this.users.find((u) => u.id === user.id);
        if(userAlreadyPresent) {
            return {message: 'User already present with this id'};
        }
        this.users.push(user);
        fs.writeJsonSync('users.json', this.users);
        return user;
    }
    getUsers() {
        return this.users;
    }
    getUser(id) {
        return this.users.find((user) => user.id === id);
    }
    updateUser(id, user) {
        const userIndex = this.users.findIndex((u) => u.id === id);
        if(userIndex === -1) {
            return {message: 'User not found'};
        }
        this.users[userIndex] = user;
        fs.writeJsonSync('users.json', this.users);
        return user;
    }
    deleteUser(id) {
        const userIndex = this.users.findIndex((user) => user.id === id);
        if(userIndex === -1) {
            return {message: 'User not found'};
        }
        this.users.splice(userIndex, 1);
        fs.writeJsonSync('users.json', this.users);
        return {message: 'User deleted successfully'};
    }
}
module.exports = Auth;
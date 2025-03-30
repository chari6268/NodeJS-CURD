const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
const {fetchData, writeData, updateData, deleteData ,fetchDataById} = require('./firebaseDB');
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
class LoginAuth {
    constructor() {
        this.users = async () => await fetchData('users');
    }
    // validate token and return user details
    static async validateToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await fetchDataById('loginStatus', decoded.username);
            return user;
        } catch (err) {
            return false;
        }
    }
    static async validateUser(username, password) {
        const users = await fetchData('users');
        const cleanData = users.filter(item => item !== null);
        if(cleanData.find((user) => user.username === username && user.password === password)) {
            // generate jwt token and return it
            const userLoginStatus = {username, status: 'active', timestamp: new Date().toISOString(), token: jwt.sign({username}, process.env.JWT_SECRET, {expiresIn: '1h'})};
            return this.addUserLoginStatus(userLoginStatus);;
        }
        return false;
    }
    static async addUserLoginStatus(user) {
        const users = await fetchData('loginStatus');
        const usersArray = Array.isArray(users) ? 
        users.filter(Boolean) : 
        Object.values(users || {}).filter(Boolean);
        if(usersArray.find((u) => u.username === user.username)) {
            const userIndex = usersArray.findIndex((u) => u.username === user.username);
            usersArray[userIndex] = user;
            await updateData('loginStatus', user, user.username);
            return user;
        }
        await writeData('loginStatus', user, user.username);
        return user;
    }
}
module.exports = {Auth, LoginAuth};
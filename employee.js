import { fetchData, writeData } from './firebaseDB.js';
const { v4: uuidv4 } = require('uuid');

class Employee {
    constructor() {
       this.employee = async () => await fetchData('employees');
    }

    static async addEmployee(data) {
        const employees = await fetchData('employee');
        const employeeAlreadyPresent = Array.isArray(employees)
            ? employees.filter(Boolean)
            : Object.values(employees || {}).filter(Boolean);
            
        if (employeeAlreadyPresent.find((e) => e.email === data.email)) {
            return { message: 'Employee already present with this email' };
        }
        const employeeId = uuidv4();
        data.id = employeeId;
        await writeData('employee', data, data.id);
        return data;
    }
}

export { Employee };

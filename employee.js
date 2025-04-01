import { fetchData, writeData } from './firebaseDB.js';
import { v4 as uuidv4 } from 'uuid';

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

    // update employee by id
    static async updateEmployee(data, id) {
        const employees = await fetchData('employee');
        const employeeAlreadyPresent = Array.isArray(employees)
            ? employees.filter(Boolean)
            : Object.values(employees || {}).filter(Boolean);
            
        if (!employeeAlreadyPresent.find((e) => e.id === id)) {
            return { message: 'Employee not found' };
        }
        await writeData('employee', data, id);
        return data;
    }

    // login employee by email and password
    static async loginEmployee(email, password) {
        const employees = await fetchData('employee');
        const employeeAlreadyPresent = Array.isArray(employees)
            ? employees.filter(Boolean)
            : Object.values(employees || {}).filter(Boolean);
            
        const employee = employeeAlreadyPresent.find((e) => e.email === email && e.password === password);
        if (!employee) {
            return { message: 'Invalid email or password' };
        }else{
            // insert token and status if not present
            if(!employee.token) {
                employee.token = uuidv4();
            }if(!employee.status) {
                employee.status = 'active';
            }else {
                employee.token = uuidv4();
                employee.status = 'active';
            }
            this.updateEmployee(employee, employee.id);
        }
        return employee;
    }
}

export { Employee };

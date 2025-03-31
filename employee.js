import { fetchData, writeData } from './firebaseDB.js';

class Employee {
    constructor() {
       this.employee = async () => await fetchData('employees');
    }

    static async addEmployee(data) {
        const employees = await fetchData('employees');
        const employeeAlreadyPresent = Array.isArray(employees)
            ? employees.filter(Boolean)
            : Object.values(employees || {}).filter(Boolean);
            
        if (employeeAlreadyPresent.find((e) => e.email === data.email)) {
            return { message: 'Employee already present with this email' };
        }

        await writeData('employees', data, data.email);
        return data;
    }
}

export { Employee };

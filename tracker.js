const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const promisemysql = require("promise-mysql");

// Connection Properties
const connectionProperties = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Cricket83d!",
    database: "employees_DB"
}

// Creates the connection
const connection = mysql.createConnection(connectionProperties);


// Establishing Connection to database
connection.connect((err) => {
    if (err) throw err;

    // Start main menu function

    console.log("\n Welcome to the Employee Tracker \n");
    mainMenu();
});

// Main menu function
function mainMenu(){

    //Prompts user to choose an option
    inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "MAIN MENU",
      choices: [
        "View All Employees",
        "View All Employees by Role",
        "View All Employees by Department",
        "View All Employees by Manager",
        "Add Employee",
        "Add Role",
        "Add Department",
        "Update Employee Role",
        "Update Employee Manager",
        "Delete Employee",
        "Delete Role",
        "Delete Department",
        "View Department Budgets"
      ]
    })
    .then((answer) => {

        //Switch case depending on user option
        switch (answer.action) {
            case "View All Employees":
                viewAllEmp();
                break;

            case "View All Employees by Department":
                viewAllEmpByDept();
                break;

            case "View All Employees by Role":
                viewAllEmpByRole();
                break;

            case "Add Employee":
                addEmp();
                break;

            case "Add Department":
                addDept();
                break;
            case "Add Role":
                addRole();
                break;
            case "Update Employee Role":
                updateEmpRole();
                break;
            case "Update Employee Manager":
                updateEmpMngr();
                break;
            case "View All Employees by Manager":
                viewAllEmpByMngr();
                break;
            case "Delete Employee":
                deleteEmp();
                break;
            case "View Department Budgets":
                viewDeptBudget();
                break;
            case "Delete Role":
                deleteRole();
                break;
            case "Delete Department":
                deleteDept();
                break;
        }
    });
}

//View all Employees 
function viewAllEmp(){

    //Query to view all employees
    let query = "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC";

    //Query from connection
    connection.query(query, function(err, res) {
        if(err) return err;
        console.log("\n");

        // Display query results using console.table
        console.table(res);

        //Back to main menu
        mainMenu();
    });
}

//View all Employees by Department
function viewAllEmpByDept(){

    //Set global array to store Department names
    let deptArr = [];

    //Creates new connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        //Query just names of Department
        return conn.query('SELECT name FROM department');
    }).then(function(value){

        //Place all names within deptArr
        deptQuery = value;
        for (i=0; i < value.length; i++){
            deptArr.push(value[i].name);
            
        }
    }).then(() => {

        // Prompt user to select Department from array of Department
        inquirer.prompt({
            name: "department",
            type: "list",
            message: "Which department would you like to search?",
            choices: deptArr
        })    
        .then((answer) => {

            // Query all Employees depending on selected Department
            const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = '${answer.department}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if(err) return err;
                
                // Show results in console.table
                console.log("\n");
                console.table(res);

                // Back to main menu
                mainMenu();
            });
        });
    });
}

//View all Employees by role
function viewAllEmpByRole(){

    //Sets global array to store all roles
    let roleArr = [];

    //Creates connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {

        //Query all roles
        return conn.query('SELECT title FROM role');
    }).then(function(roles){

        //Places all roles within the roleArry
        for (i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }
    }).then(() => {

        //Prompts user to select a role
        inquirer.prompt({
            name: "role",
            type: "list",
            message: "Which role would you like to search?",
            choices: roleArr
        })    
        .then((answer) => {

            //Query all employees by role selected by user
            const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE role.title = '${answer.role}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if(err) return err;

                //Shows results using console.table
                console.log("\n");
                console.table(res);
                mainMenu();
            });
        });
    });
}

//Adds employee
function addEmp(){

    //Creates two global array to hold 
    let roleArr = [];
    let managerArr = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        //Queries all roles and all manager. Pass as a promise
        return Promise.all([
            conn.query('SELECT id, title FROM role ORDER BY title ASC'), 
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
        ]);
    }).then(([roles, managers]) => {

        //Places all roles in array
        for (i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }

        //Places all managers in array
        for (i=0; i < managers.length; i++){
            managerArr.push(managers[i].Employee);
        }

        return Promise.all([roles, managers]);
    }).then(([roles, managers]) => {

        //Adds option for no manager
        managerArr.unshift('--');

        inquirer.prompt([
            {
                //Prompts user of their first name
                name: "firstName",
                type: "input",
                message: "First name: ",
                
                //Validates the field is not blank
                validate: function(input){
                    if (input === ""){
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            },
            {
                //Prompts user of their last name
                name: "lastName",
                type: "input",
                message: "Lastname name: ",
                
                //Validates the field is not blank
                validate: function(input){
                    if (input === ""){
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            },
            {
                //Prompts user of their role
                name: "role",
                type: "list",
                message: "What is their role?",
                choices: roleArr
            },{
                //Prompts user for manager
                name: "manager",
                type: "list",
                message: "Who is their manager?",
                choices: managerArr
            }]).then((answer) => {

                //Sets variable for IDs
                let roleID;

                //Sets default Manager value as null
                let managerID = null;

                //Gets ID of role selected
                for (i=0; i < roles.length; i++){
                    if (answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }

                //Gets ID of manager selected
                for (i=0; i < managers.length; i++){
                    if (answer.manager == managers[i].Employee){
                        managerID = managers[i].id;
                    }
                }

                //Adds Employee
                connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ("${answer.firstName}", "${answer.lastName}", ${roleID}, ${managerID})`, (err, res) => {
                    if(err) return err;

                    //Confirms employee has been added
                    console.log(`\n EMPLOYEE ${answer.firstName} ${answer.lastName} ADDED...\n `);
                    mainMenu();
                });
            });
    });
}

//Adds Role
function addRole(){

    //Creates array of Departments
    let departmentArr = [];

    //Creates connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {

        //Queries all Departments
        return conn.query('SELECT id, name FROM department ORDER BY name ASC');

    }).then((departments) => {
        
        //Place all Departments in array
        for (i=0; i < departments.length; i++){
            departmentArr.push(departments[i].name);
        }

        return departments;
    }).then((departments) => {
        
        inquirer.prompt([
            {
                //Prompts the user for the role title
                name: "roleTitle",
                type: "input",
                message: "Role title: "
            },
            {
                //Prompts the user for the salary
                name: "salary",
                type: "number",
                message: "Salary: "
            },
            {   
                //Prompts the user to select Department role is under
                name: "dept",
                type: "list",
                message: "Department: ",
                choices: departmentArr
            }]).then((answer) => {

                //Sets the Department ID variable
                let deptID;

                //Gets the ID of the Department selected
                for (i=0; i < departments.length; i++){
                    if (answer.dept == departments[i].name){
                        deptID = departments[i].id;
                    }
                }

                //Added role to the role table
                connection.query(`INSERT INTO role (title, salary, department_id)
                VALUES ("${answer.roleTitle}", ${answer.salary}, ${deptID})`, (err, res) => {
                    if(err) return err;
                    console.log(`\n ROLE ${answer.roleTitle} ADDED...\n`);
                    mainMenu();
                });

            });

    });
    
}

//Adds Department
function addDept(){

    inquirer.prompt({

            //Prompts the user for the Department name
            name: "deptName",
            type: "input",
            message: "Department Name: "
        }).then((answer) => {
                
            //Adds Department to the table
            connection.query(`INSERT INTO department (name)VALUES ("${answer.deptName}");`, (err, res) => {
                if(err) return err;
                console.log("\n DEPARTMENT ADDED...\n ");
                mainMenu();
            });

        });
}

//Update Employee Role
function updateEmpRole(){

    //Creates employee and role array
    let employeeArr = [];
    let roleArr = [];

    //Creates connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {
        return Promise.all([

            //Queries all roles and employee
            conn.query('SELECT id, title FROM role ORDER BY title ASC'), 
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
        ]);
    }).then(([roles, employees]) => {

        //Places all roles in array
        for (i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }

        //Places all Empoyees in array
        for (i=0; i < employees.length; i++){
            employeeArr.push(employees[i].Employee);
        }

        return Promise.all([roles, employees]);
    }).then(([roles, employees]) => {

        inquirer.prompt([
            {
                //Prompts user to select Employee
                name: "employee",
                type: "list",
                message: "Who would you like to edit?",
                choices: employeeArr
            }, {
                //Selects role to update Employee
                name: "role",
                type: "list",
                message: "What is their new role?",
                choices: roleArr
            },]).then((answer) => {

                let roleID;
                let employeeID;

                ///Gets ID of the role selected
                for (i=0; i < roles.length; i++){
                    if (answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }

                //Gets the ID of Employee selected
                for (i=0; i < employees.length; i++){
                    if (answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }
                
                //Updates Employee with new role
                connection.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) return err;

                    //Confirms update Employee
                    console.log(`\n ${answer.employee} ROLE UPDATED TO ${answer.role}...\n `);

                    //Goes back to main menu
                    mainMenu();
                });
            });
    });
}

// Updates the Employee manager
function updateEmpMngr(){

    //Sets Employee global array
    let employeeArr = [];

    // Creates connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        //Queries all Employees
        return conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC");
    }).then((employees) => {

        //Places Employees in array
        for (i=0; i < employees.length; i++){
            employeeArr.push(employees[i].Employee);
        }

        return employees;
    }).then((employees) => {

        inquirer.prompt([
            {
                //Prompts user to select employee
                name: "employee",
                type: "list",
                message: "Who would you like to edit?",
                choices: employeeArr
            }, {
                //Prompts user to select new manager
                name: "manager",
                type: "list",
                message: "Who is their new Manager?",
                choices: employeeArr
            },]).then((answer) => {

                let employeeID;
                let managerID;

                //Gets ID of selected Manager
                for (i=0; i < employees.length; i++){
                    if (answer.manager == employees[i].Employee){
                        managerID = employees[i].id;
                    }
                }

                //Gets ID of selected Employee
                for (i=0; i < employees.length; i++){
                    if (answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }

                //Updates Employee with Manager ID
                connection.query(`UPDATE employee SET manager_id = ${managerID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) return err;

                    //Confirms update Employee
                    console.log(`\n ${answer.employee} MANAGER UPDATED TO ${answer.manager}...\n`);

                    //Goes back to the main menu
                    mainMenu();
                });
            });
    });
}

// View all Employees by Manager
function viewAllEmpByMngr(){

    //Sets manager array
    let managerArr = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {

        // Query all Employees
        return conn.query("SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Inner JOIN employee m ON e.manager_id = m.id");

    }).then(function(managers){

        //Places all Employees in array
        for (i=0; i < managers.length; i++){
            managerArr.push(managers[i].manager);
        }

        return managers;
    }).then((managers) => {

        inquirer.prompt({

            //Prompts user of Manager
            name: "manager",
            type: "list",
            message: "Which manager would you like to search?",
            choices: managerArr
        })    
        .then((answer) => {

            let managerID;

            //Gets ID of Manager selected
            for (i=0; i < managers.length; i++){
                if (answer.manager == managers[i].manager){
                    managerID = managers[i].id;
                }
            }

            //Queries all Employees by selected Manager
            const query = `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager
            FROM employee e
            LEFT JOIN employee m ON e.manager_id = m.id
            INNER JOIN role ON e.role_id = role.id
            INNER JOIN department ON role.department_id = department.id
            WHERE e.manager_id = ${managerID};`;
    
            connection.query(query, (err, res) => {
                if(err) return err;
                
                //Displays results with console.table
                console.log("\n");
                console.table(res);

                //Goes back to main menu
                mainMenu();
            });
        });
    });
}

//Deletes Employee
function deleteEmp(){

    //Creates global Employee array
    let employeeArr = [];

    //Creates connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        //Queriesy all Employees
        return  conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS employee FROM employee ORDER BY Employee ASC");
    }).then((employees) => {

        //Places all Employees in array
        for (i=0; i < employees.length; i++){
            employeeArr.push(employees[i].employee);
        }

        inquirer.prompt([
            {
                //Prompts user of all Employees
                name: "employee",
                type: "list",
                message: "Who would you like to delete?",
                choices: employeeArr
            }, {
                //Confirms the deletion of the Employee
                name: "yesNo",
                type: "list",
                message: "Confirm deletion",
                choices: ["NO", "YES"]
            }]).then((answer) => {

                if(answer.yesNo == "YES"){
                    let employeeID;

                    // If confirmed, get ID of Employee selected
                    for (i=0; i < employees.length; i++){
                        if (answer.employee == employees[i].employee){
                            employeeID = employees[i].id;
                        }
                    }
                    
                    //Deleted selected Employee
                    connection.query(`DELETE FROM employee WHERE id=${employeeID};`, (err, res) => {
                        if(err) return err;

                        //Confirms deleted Employee
                        console.log(`\n EMPLOYEE '${answer.employee}' DELETED...\n `);
                        
                        //Goes back to main menu
                        mainMenu();
                    });
                } 
                else {
                    
                    //If not confirmed, go back to main menu
                    console.log(`\n EMPLOYEE '${answer.employee}' NOT DELETED...\n `);

                    //Goes back to main menu
                    mainMenu();
                } 
            });
    });
}

//Deletes Role
function deleteRole(){

    //Creates role array
    let roleArr = [];

    //Creates connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        //Queries all roles
        return conn.query("SELECT id, title FROM role");
    }).then((roles) => {    

        //Adds all roles to array
        for (i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }

        inquirer.prompt([{
            //Confirms to continue to select role to delete
            name: "continueDelete",
            type: "list",
            message: "*** WARNING *** Deleting role will delete all employees associated with the role. Do you want to continue?",
            choices: ["NO", "YES"]
        }]).then((answer) => {

            //If not, go to main menu
            if (answer.continueDelete === "NO") {
                mainMenu();
            }

        }).then(() => {

            inquirer.prompt([{
                //Prompts user of of roles
                name: "role",
                type: "list",
                message: "Which role would you like to delete?",
                choices: roleArr
            }, {
                //Confirms to delete role by typing role exactly
                name: "confirmDelete",
                type: "Input",
                message: "Type the role title EXACTLY to confirm deletion of the role"

            }]).then((answer) => {

                if(answer.confirmDelete === answer.role){

                    //Get role id of of selected role
                    let roleID;
                    for (i=0; i < roles.length; i++){
                        if (answer.role == roles[i].title){
                            roleID = roles[i].id;
                        }
                    }
                    
                    //Deletes the role
                    connection.query(`DELETE FROM role WHERE id=${roleID};`, (err, res) => {
                        if(err) return err;

                        //Confirms the  role has been added 
                        console.log(`\n ROLE '${answer.role}' DELETED...\n `);

                        //Goes back to the main menu
                        mainMenu();
                    });
                } 
                else {

                    //If not confirmed, do not delete
                    console.log(`\n ROLE '${answer.role}' NOT DELETED...\n `);

                    //Goes back to the main menu
                    mainMenu();
                }
            });
        })
    });
}

// Deletes the Department
function deleteDept(){

    //Department array
    let deptArr = [];

    //Creates the connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        //Queries all Department
        return conn.query("SELECT id, name FROM department");
    }).then((depts) => {

        //Adds all Department to array
        for (i=0; i < depts.length; i++){
            deptArr.push(depts[i].name);
        }

        inquirer.prompt([{

            //Confirms to continue to select department to delete
            name: "continueDelete",
            type: "list",
            message: "*** WARNING *** Deleting a department will delete all roles and employees associated with the department. Do you want to continue?",
            choices: ["NO", "YES"]
        }]).then((answer) => {

            //If not, go back to main menu
            if (answer.continueDelete === "NO") {
                mainMenu();
            }

        }).then(() => {

            inquirer.prompt([{

                //Prompts user to select Department
                name: "dept",
                type: "list",
                message: "Which department would you like to delete?",
                choices: deptArr
            }, {

                //Confirms with user to delete
                name: "confirmDelete",
                type: "Input",
                message: "Type the department name EXACTLY to confirm deletion of the department: "

            }]).then((answer) => {

                if(answer.confirmDelete === answer.dept){

                    //If confirmed, get Department id
                    let deptID;
                    for (i=0; i < depts.length; i++){
                        if (answer.dept == depts[i].name){
                            deptID = depts[i].id;
                        }
                    }
                    
                    //Deletes Department
                    connection.query(`DELETE FROM department WHERE id=${deptID};`, (err, res) => {
                        if(err) return err;

                        //Confirms Department has been deleted
                        console.log(`\n DEPARTMENT '${answer.dept}' DELETED...\n `);

                        //Goes back to the main menu
                        mainMenu();
                    });
                } 
                else {

                    //Do not delete Department if not confirmed and go back to main menu
                    console.log(`\n DEPARTMENT '${answer.dept}' NOT DELETED...\n `);

                    //Goes back to main menu
                    mainMenu();
                } 
            });
        })
    });
}

//Views Department Budget
function viewDeptBudget(){

    //Creates connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {
        return  Promise.all([

            //Queries all Department and salaries
            conn.query("SELECT department.name AS department, role.salary FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY department ASC"),
            conn.query('SELECT name FROM department ORDER BY name ASC')
        ]);
    }).then(([deptSalaies, departments]) => {
        
        let deptBudgetArr =[];
        let department;

        for (d=0; d < departments.length; d++){
            let departmentBudget = 0;

            // add all salaries together
            for (i=0; i < deptSalaies.length; i++){
                if (departments[d].name == deptSalaies[i].department){
                    departmentBudget += deptSalaies[i].salary;
                }
            }

            // create new property with budgets
            department = {
                Department: departments[d].name,
                Budget: departmentBudget
            }

            // add to array
            deptBudgetArr.push(department);
        }
        console.log("\n");

        // display Department budgets using console.table
        console.table(deptBudgetArr);

        // back to main menu
        mainMenu();
    });
}
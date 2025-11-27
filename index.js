const {program} = require('commander');
const fs = require('fs');
const path = require('path');
const { stringify } = require('querystring');

const datafile = path.join(__dirname, "expenses.json");

function loadExpenses() {
    if(!fs.existsSync(datafile)) return [];
    return JSON.parse(fs.readFileSync(datafile,"utf8"));
}

function saveExpenses(expenses) {
    fs.writeFileSync(datafile, JSON.stringify(expenses, null, 2));
}

program
    .command("add")
    .description("Add an expense")
    .requiredOption("--description <string>", "Expense Description")
    .requiredOption("--amount <number>", "Expense Amount")
    .action((options) => {
        const expenses = loadExpenses();
        const newExpense = {
            id: expenses.length? expenses[expenses.length-1].id + 1 : 1,
            date: new Date().toISOString().split("T")[0],
            description: options.description,
            amount: parseFloat(options.amount),
        };
        expenses.push(newExpense);
        saveExpenses(expenses);
        console.log(`Expenses successfully added (ID: ${newExpense.id})`);
    });

program
    .command("update")
    .description("Update an expense")
    .requiredOption("--id <number>", "Expense ID")
    .option("--description <string>", "Expense Description")
    .option("--amount <number>", "Expense Amount")
    .action((options) => {
        const expenses = loadExpenses();
        const expense = expenses.find(e=> e.id === parseInt(options.id));
        if(!expense) return("Expense not found!");
        if(options.description) expense.description = options.description;
        if(options.amount) expense.amount = parseFloat(options.amount);
        saveExpenses(expenses);
        console.log(`Expenses successfully updated (ID: ${expense.id})`)
    })

program
    .command("delete")
    .description("Delete an expense")
    .requiredOption("--id <number>", "Expense ID")
    .action((options) => {
        const expenses = loadExpenses();
        const index = expenses.findIndex(e=> e.id === parseInt(options.id));
        if(index === -1) return console.log(`Expense not found`);
        expenses.splice(index, 1);
        saveExpenses(expenses);
        console.log(`Expenses successfully deleted`)
    })

program
    .command("list")
    .description("List all expenses")
    .action(()=>{
        const expenses = loadExpenses();
        if(expenses.length == 0) console.log("No expenses to list");
        console.log("ID     Date        Description         Amount");
        expenses.forEach(e => {
            console.log(`${e.id}    ${e.date}        ${e.description}        ${e.amount}`);
        });
    });

program
    .command("summary")
    .description("Show summary of expenses")
    .option("--month <number>", "Month(1-12)")
    .action((options) => {
        const expenses = loadExpenses();
        let filtered = expenses;
        if(options.month){
            const month = parseInt(options.month);
            filtered = expenses.filter(e=> new Date(e.date).getMonth() + 1 === month);
            const total = filtered.reduce((a, b) => a + b.amount, 0);
            console.log(`Total expenses for ${month}: ${total}`);
        } else {
            const total = expenses.reduce((a,b)=>a+b.amount,0);
            console.log(`Total expenses: ${total}`);
        }
    });

program.parse(process.argv);


#! /usr/bin/env node
// This is a shebang line, which tells the operating system that this file is a Node.js script.

const { Command } = require("commander"); 
// Import the commander module and extract the command class.
const figlet = require("figlet"); 
// This imports the figlet module

const program = new Command(); 
// Sets the program variable to make a new instance of the command class  

const fs = require("fs"); 
// This imports the fs module, which is a built-in module in Node.js

const path = require("path");
// This imports the path module, which is a built-in module in Node.js

console.log(figlet.textSync("Dir Manager")); 
// It invokes the textSync method to turn the text into ASCII art
// Print the figlet text

// Now we can define the CLI options in the file 
program 
    .version("1.0.0")
    .description("A CLI for managing a directory") 
    .option("-l, --list [value]", "List all files in the directory") 
    .option("-m, --mkdir <value>", "Create a new directory")
    .option("-t, --touch <value>", "Create a new file")
    .option("-r, --remove <value>", "Remove a file or directory")
    .parse(process.argv); 
// Uses the program variable that contains the Commander instance to invoke the version() method
// The version() method takes a string containing the version of the CLI
// Commander.js creates the -v option for you 

// The description() method takes a string that describes the CLI program 
// The option() method takes two arguments, the option, and the description of the option. 
// The first argument is the option, where it takes the -l option and the --ls long version. Value is an optional argument so it is wrapped in []. 
// The second argument is the description of the option, which will be shown with the -h option. 
// The other two options are mkdir and touch, where the <> shows that it specifies a value. 
// The parse method processes the arguments in the process.argv, which is an array containing the arguments the user passed. 
// The first argument is node and the second argument is the program filename and the rest are additional arguments. 

const options = program.opts(); 
// The options variable returns an object that has CLI options as properties, whose values are the arguments passed by the user. 

async function listDirContents(filepath: string) {
    try {
        const files = await fs.promises.readdir(filepath); 
        // The readdir() method takes the directory path and uses it to read it's contents. 
        // It returns a promise, we prefix it with the await keyword to wait for it to resolve 
        // The await keyword can only be used inside an async function

        const detailedFilesPromises = files.map(async (file: string) => { 
            let fileDetails = await fs.promises.lstat(path.resolve(filepath, file)); 
            const { size, birthtime } = fileDetails; 
            return { filename: file, "size(KB)": size, created_at: birthtime }; 
        })
        // We iterate over each element in the files array and return a new array using the map() method. 
        // The map method takes an asynchronous callback function which accepts the file parameter. 
        // In the callback, we invoke fs.promises.lstat() with the path of the file to get details about the file, such as size, birthtime, and info
        // The properties are then extracted to the fileDetails object and return an object with the properties that the map method retunrs 
        const detailedFiles = await Promise.all(detailedFilesPromises); 
        console.table(detailedFiles); 
        // Once each element returns a promise and is evaluated to an object, we invoke Promise.all() to wait for all of them to resolve
        // The Promise.all() method takes an array of promises as an argument and returns a single Promise that resolves when all of the promises in the argument array have resolved or when the argument array contains no promises.
        // Console.table() logs the data into the console. 
    } catch (error) {
        console.error("Error occured while reading the directory!", error); 
    }
}
// This is an asynchronous function that takes a filepath parameter which is a string, making sure that it only accepts strings as arguments 
// The try block is used to execute the code that might throw an error
// The catch block is used to handle the error 
// The async keyword is used to define an asynchronous function
// The await keyword is used to wait for a Promise. It can only be used inside an async function.

function createDir(filepath: string) {
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath); 
        // The mkdirSync() method creates a directory synchronously.
        console.log("The directory was created successfully"); 
    }
    // First we check if the given directory exists. 
    // If it doesn't, then we call fs.mkdirSync() to create the directory.
    // Then we log a success message 
}

function createFile(filepath: string) {
    fs.openSync(filepath, "w"); 
    console.log("An empty file has been created"); 
    // The openSync() method takes the filepath and the flag as arguments.
    // The flag is a string that specifies the behavior of the file.
    // The "w" flag means that the file is opened for writing. If the file does not exist, an empty file is created.
    // Then we log a success message
}

function removeFile(filepath: string) {
    fs.unlinkSync(filepath); 
    console.log("The file has been removed");
}

// Now we check if the user has called the function 
if (options.list) {
    const filepath = typeof options.ls === "string" ? options.ls : __dirname; 
    listDirContents(filepath); 
}
// This checks if the user has used the -l or --ls option. 
// If the user has passed a value, then that string is passed to the function, otherwise, it passes the current directory. 

if (options.mkdir) {
    createDir(path.resolve(__dirname, options.mkdir));
}
// This checks if the user has used the -m or --mkdir option.
// If they did, then the full path to index.js is passed to create the directory
if (options.touch) {
    createFile(path.resolve(__dirname, options.touch));
}
// This checks if the user has used the -t or --touch option.
// createFile() is now invoked with the full path to the file.

if (options.remove) {
    removeFile(path.resolve(__dirname, options.remove)); 
}

if(!process.argv.slice(2).length) {
    program.outputHelp(); 
}
// This checks if the user passed any arguments, and if they didn't, it prints out the help message. 
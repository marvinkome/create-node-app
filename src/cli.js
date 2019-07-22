import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

function parseArgs() {
    const args = arg({});

    return {
        name: args._[0]
    }
}

async function promptForMissingOptions(options) {
    const questions = [];
    if (!options.name) {
        questions.push({
            type: 'input',
            name: 'name',
            message: 'Please choose the project name'
        })
    }

    const answers = await inquirer.prompt(questions);
    return {
        name: options.name || answers.name
    }
}

export async function cli(args) {
    let options = parseArgs(args);
    options = await promptForMissingOptions(options);
    await createProject(options)
}
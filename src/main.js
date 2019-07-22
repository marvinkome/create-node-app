import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import execa from 'execa';
import listr from 'listr';
import editJSONFile from 'edit-json-file';
import { promisify } from 'util';
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false
    })
}

async function moveFiles(options) {
     // check if directory exists
    try {
        await exists(options.targetDirectory)
    } catch (e) {
        console.error('%s Folder already exists', chalk.red.bold('ERROR'));
        throw Error()
    }

    // create target directory
    try {
        await mkdir(options.targetDirectory)
    } catch(e) {
        console.error('%s Can\'t create folder', chalk.red.bold('ERROR'));
        throw Error()
    }

    // copy template files to directory
    try {
        const templateDir = path.resolve(
            new URL(import.meta.url).pathname, 
            '../../templates/apollo-ts'
        );

        options.templateDirectory = templateDir;
        console.log('Copy project files');
        await copyTemplateFiles(options);
    } catch (e) {
        console.error('%s Can\'t copy files to directory', chalk.red.bold('ERROR'));
        throw Error()
    }
}

async function initGit(options) {
    const result = await execa('git', ['init'], { cwd: options.targetDirectory })
    if (result.failed) {
        return Promise.reject(new Error('Failed to initialize git'));
    }

    return;
}

async function updatePackageJson(options) {
    const file = editJSONFile(`${options.targetDirectory}/package.json`);
    file.set('name', options.name);
    file.save();
    return;
}

async function cleanUp(options) {
    // remove directory
    const result = await execa('rm', ['-rf', options.targetDirectory])
    if (result.failed) {
        return Promise.reject(new Error('Failed to remove directory'));
    }

    return;
}

export async function createProject(options) {
    options = {
        ...options,
        targetDirectory: `./${options.name}`
    }

    const tasks = new listr([
        {
            title: 'Copy project files',
            task: () => moveFiles(options)
        },
        {
            title: 'Initialize git',
            task: () => initGit(options)
        },
        {
            title: 'Install dependencies',
            task: () => projectInstall({ cwd: options.targetDirectory })
        },
        {
            title: 'Update package.json',
            task: () => updatePackageJson(options)
        }
    ])

    try {
        await tasks.run();
    } catch(e) {
        // run clean up
        cleanUp(options);
    }
    
    console.log('%s Project ready', chalk.green.bold('DONE'));
    return true;
}
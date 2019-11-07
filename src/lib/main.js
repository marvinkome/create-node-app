import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import execa from "execa";
import listr from "listr";
import editJSONFile from "edit-json-file";
import { promisify } from "util";
import { projectInstall } from "pkg-install";

const access = promisify(fs.access);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  return copy(options.templateDirectory, options.targetDirectory, {
    clobber: false
  });
}

async function moveFiles(options) {
  // check if directory exists
  try {
    await exists(options.targetDirectory);
  } catch (e) {
    throw Error(e);
  }

  // create target directory
  try {
    await mkdir(options.targetDirectory);
  } catch (e) {
    throw Error(e);
  }

  // copy template files to directory
  try {
    const templateDir = path.join(__dirname, "../../templates/apollo-ts");
    options.templateDirectory = templateDir;
    console.log("==== Copy project files ====");
    await copyTemplateFiles(options);
  } catch (e) {
    throw Error(e);
  }
}

async function initGit(options) {
  const result = await execa("git", ["init"], { cwd: options.targetDirectory });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }

  return;
}

async function updatePackageJson(options) {
  const file = editJSONFile(`${options.targetDirectory}/package.json`);
  file.set("name", options.name);
  file.save();
  return;
}

async function cleanUp(options) {
  // remove directory
  const result = await execa("rm", ["-rf", options.targetDirectory]);
  if (result.failed) {
    return Promise.reject(new Error("Failed to remove directory"));
  }

  return;
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: path.resolve(options.name)
  };

  const tasks = new listr([
    {
      title: "Copy project files",
      task: () => moveFiles(options)
    },
    {
      title: "Initialize git",
      task: () => initGit(options),
      skip: () => options.noGit
    },
    {
      title: "Install dependencies",
      task: () =>
        projectInstall({ cwd: options.targetDirectory, prefer: "yarn" }),
      skip: () => options.noDepsInstall
    },
    {
      title: "Update package.json",
      task: () => updatePackageJson(options)
    }
  ]);

  try {
    await tasks.run();
  } catch (e) {
    // run clean up
    cleanUp(options);
    return console.log("%s", chalk.red.bold("Setup failed"));
  }

  console.log("%s Project ready", chalk.green.bold("DONE"));
  return true;
}

import program from "commander";
import init from "./commands/init";
import packageJson from "../package.json";

export async function cli(rawargs) {
  program.version(packageJson.version);

  program
    .command("init <name>")
    .alias("i")
    .option("--no-git", "Skip git init")
    .option("--no-dependencies", "Skip installing dependencies")
    .option("--use-npm", "Use npm to install packages", false)
    .description("Create a new node app")
    .action(init);

  // error on unknown commands
  program.on("command:*", function() {
    console.error("Invalid command: %s\n", program.args.join(" "));
    program.outputHelp();
  });

  program.parse(rawargs);

  const NO_COMMAND_SPECIFIED = program.args.length === 0;
  if (NO_COMMAND_SPECIFIED) {
    program.outputHelp();
  }
}

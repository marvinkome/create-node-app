import { createProject } from "../lib/main";

export default function initCommand(name, cmdObj) {
  const options = {
    name,
    noGit: !cmdObj.git,
    noDepsInstall: !cmdObj.dependencies,
    useNpm: cmdObj.useNpm
  };

  createProject(options);
}

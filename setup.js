const createWindowsInstaller = require("electron-winstaller")
  .createWindowsInstaller;
const path = require("path");

// var install = require('electron-linux-installer')
// install({
//   src: 'dist/Pensive-linux-x64/', // source location
//   dest: 'dist/installers/', // destination of the installer
//   arch: 'x86_64', // x86_x64 would work both debian and rpm cause controllers are here.
//   for: 'both' // can be debian or redhat
// }).then(success => {
//   console.log(success)
// }).catch(e => {
//   throw e
// })

getWindowsInstallerConfig()
  .then(createWindowsInstaller)
  .catch(error => {
    console.error(error.message || error);
    process.exit(1);
  });

function getWindowsInstallerConfig() {
  console.log("creating windows installer");
  const rootPath = path.join("./");
  const outPath = path.join(rootPath, "dist");

  return Promise.resolve({
    appDirectory: path.join(outPath, "Pensive-win32-ia32/"),
    authors: "Connor Davis",
    noMsi: true,
    outputDirectory: path.join(outPath, "Pensive-Installer"),
    exe: "pensive-desktop.exe",
    setupExe: "Pensive-Setup.exe",
    setupIcon: path.join(rootPath, "public", "favicon.ico")
  });
}

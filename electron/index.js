"use-strict";
if (require("electron-squirrel-startup")) return;

const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

const ProgressBar = require("electron-progressbar");

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification
} = require("electron");
const {
  CapacitorSplashScreen,
  configCapacitor
} = require("@capacitor/electron");

const path = require("path");
const url = require("url");

// configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

// Place holders for our windows so they don't get garbage collected.
let mainWindow = null;

// Placeholder for SplashScreen ref
let splashScreen = null;

//Change this if you do not wish to have a splash screen
let useSplashScreen = true;

async function createWindow() {
  // Define our main window size
  mainWindow = new BrowserWindow({
    height: 720,
    width: 1280,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(
        __dirname,
        "node_modules",
        "@capacitor",
        "electron",
        "dist",
        "electron-bridge.js"
      )
    }
  });

  configCapacitor(mainWindow);

  if (useSplashScreen) {
    splashScreen = new CapacitorSplashScreen(mainWindow);
    splashScreen.init(false);
  } else {
    // and load the index.html of the app.
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
      })
    );

    mainWindow.webContents.on("dom-ready", () => {
      mainWindow.show();
      mainWindow.webContents.openDevTools();
      sendStatusToWindow({ text: "Hello", type: "text" });
    });
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  var progressBar = new ProgressBar({
    indeterminate: false,
    text: "Preparing data...",
    detail: "Wait..."
  });

  const sendStatusToWindow = data => {
    if (data.type === "text") {
      log.info(data.text);
      if (mainWindow) {
        const notification = new Notification({
          title: "Pensive",
          body: data.text
        });
        notification.show();
      }
    } else if (data.type === "progress") {
      log.info(data.text);
      if (mainWindow) {
        progressBar
          .on("completed", function() {
            console.info(`completed...`);
            progressBar.detail = "Task completed. Exiting...";
          })
          .on("aborted", function(value) {
            console.info(`aborted... ${value}`);
          })
          .on("progress", function(value) {
            progressBar.detail = `Value ${data.transferred} out of ${
              progressBar.getOptions().maxValue
            }...`;
          });

        if (!progressBar.isCompleted()) {
          progressBar.value += 1;
        }
      }
    }
  };

  // trigger autoupdate check
  autoUpdater.checkForUpdates();

  autoUpdater.on("checking-for-update", () => {
    sendStatusToWindow({ text: "Checking for update...", type: "text" });
  });
  autoUpdater.on("update-available", info => {
    sendStatusToWindow({ text: "Update available.", type: "text" });
  });
  autoUpdater.on("update-not-available", info => {
    sendStatusToWindow({ text: "Update not available.", type: "text" });
  });
  autoUpdater.on("error", err => {
    sendStatusToWindow({
      text: `Error in auto-updater: ${err.toString()}`,
      type: "text"
    });
  });
  autoUpdater.on("download-progress", progressObj => {
    sendStatusToWindow({
      speed: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
      type: "progress"
    });
  });
  autoUpdater.on("update-downloaded", info => {
    sendStatusToWindow({
      text: "Update downloaded; will install now",
      type: "text"
    });
    progressBar.setCompleted();
  });

  autoUpdater.on("update-downloaded", info => {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 500 ms.
    // You could call autoUpdater.quitAndInstall(); immediately
    autoUpdater.quitAndInstall();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Define any IPC or other custom functionality below here
var handleStartupEvent = function() {
  if (process.platform !== "win32") {
    return false;
  }

  var squirrelCommand = process.argv[1];
  switch (squirrelCommand) {
    case "--squirrel-install":
    case "--squirrel-updated":
      // Optionally do things such as:
      //
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Always quit when done
      app.quit();

      return true;
    case "--squirrel-uninstall":
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Always quit when done
      app.quit();

      return true;
    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
};

if (handleStartupEvent()) {
  return;
}

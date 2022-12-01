const { Menu, Tray } = require("electron");

class AppTray {
  constructor(icon, mainWindow, app) {
    this.tray = new Tray(icon);
    this.mainWindow = mainWindow;
    this.app = app;

    this.tray.on("click", this.onClick.bind(this));
    this.tray.on("right-click", this.rightClick.bind(this));
  }

  onClick() {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.mainWindow.show();
    }
  }

  rightClick() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Quit",
        click: () => {
          this.app.isQuitting = true;
          this.app.quit();
        },
      },
    ]);

    this.tray.popUpContextMenu(contextMenu);
  }
}

module.exports = AppTray;

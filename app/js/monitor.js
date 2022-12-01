const path = require("path");
const {ipcRenderer} = require('electron')
const osu = require("node-os-utils");
const { setInterval } = require("timers");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload;
let alertFrequency;

// get settings & values
ipcRenderer.on('settings:get', (e, settings) =>{
    cpuOverload = +settings.cpuOverload;
    alertFrequency = +settings.alertFrequency;
}
)

// Run every second
setInterval(() => {
  //CPU Usage
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%";

    document.getElementById("cpu-progress").style.width = info + "%";

    // make progress bar red if overloadded
    if (info > cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#30c88b";
    }

    // check overload
    if(info > cpuOverload && runNotify(alertFrequency)){
        NotifyUser({
          title: "CPU OVERLOADED",
          body: `CPU IS OVER ${cpuOverload}% !`,
          icon: path.join(__dirname, "img", "icon.png"),
        });

        localStorage.setItem('lastNotify', +new Date())
    }
  });

  //Cpu Free
  cpu.free().then((info) => {
    document.getElementById("cpu-free").innerText = info + "%";
  });

  // Uptime
  document.getElementById("sys-uptime").innerText = secondsToDhms(os.uptime());
}, 1000);

// set model
console.log(cpu.model());
document.getElementById("cpu-model").innerText = cpu.model();

// computer Name
console.log(os.hostname());
document.getElementById("comp-name").innerText = os.hostname();

// OS
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`;

// Total Mem
mem.info().then((info) => {
  document.getElementById("mem-total").innerText = info.totalMemMb;
});

//show Days, hours, min, sec
function secondsToDhms(seconds) {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d} Days, ${h} Hours, ${m} Min, ${s} Sec`;
}

// send notification
function NotifyUser(options) {
  new Notification(options.title, options);
}

// check how much time has passed since last notification
function runNotify(frequency) {
    if(localStorage.getItem('lastNotify') == null){
        //store time stamp
        localStorage.setItem('lastNotify', +new Date());
        return true;
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
    const now = new Date();
    const diffTime = Math.abs(now - notifyTime);
    const minutesPassed = Math.ceil(diffTime / (1000* 60));

    if(minutesPassed > frequency) {
        return true;
    }else {
        return false;
    }
}
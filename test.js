let bluetoothLEMidi = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
let bleMidiCharacteristic = '7772e5db-3868-4112-a1a9-f2669d106bf3';

let cowbell = document.getElementsByTagName('audio')[0];
let snare = document.getElementsByTagName('audio')[1];

class FreedrumStick {
    constructor(name) {
      this.device = null;
      this.onDisconnected = this.onDisconnected.bind(this);
      this.name = name;
    }
    
    request() {
      let options = {
        "filters": [{
          "name": this.name
        },
        {services: [bluetoothLEMidi]}
        ],
      };
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
      });
    }
    
    connect() {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      }
      return this.device.gatt.connect();
    }
    
    getFreedrumData() {
      return this.device.gatt.getPrimaryService(bluetoothLEMidi)
      .then(service => service.getCharacteristic(bleMidiCharacteristic))
      .then(characteristic => characteristic.startNotifications())
      .then(characteristic => {
        characteristic.addEventListener('characteristicvaluechanged', handleData);
        return characteristic.readValue();
      })
    }
  
    disconnect() {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      }
      return this.device.gatt.disconnect();
    }
  
    onDisconnected() {
      console.log('Device is disconnected.');
    }
  }

  const handleData = (event) => {
    let data = event.target.value;
    // data will be a DataView type with byteLength of 5 because it contains 5 integers
    // e.g: [128,128,153,50,0]
    let command = data.getUint8(2);
    let note = data.getUint8(3);
    let volume = data.getUint8(4);

    console.log(command, note, volume)

    if(command === 153){
        if(note === 50 && volume > 50){
            cowbell.play()
            document.body.style.backgroundColor = 'pink';
        }

        if(note === 51 && volume > 50){
            snare.play()
            document.body.style.backgroundColor = 'purple';
        }
    }
}
  
var freeDrumStickOne = new FreedrumStick("FD2 v8");
// var freeDrumStickTwo = new FreedrumStick("FD2 v8");
var freeDrumFoot = new FreedrumStick("FD2 v9");

document.querySelector('button').addEventListener('click', event => {
let currentSensor = getSensorToConnect()
currentSensor.request()
.then(_ => currentSensor.connect())
.then(_ => { currentSensor.getFreedrumData()})
.catch(error => { console.log(error) });
});

const getSensorToConnect = () => {
    let currentSensor;

    if(freeDrumStickOne.device !== null){ //one stick already connected
        currentSensor = freeDrumFoot;
    } else {
        currentSensor = freeDrumStickOne;
    }
    return currentSensor
}
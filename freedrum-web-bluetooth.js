let bluetoothLEMidi = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
let bleMidiCharacteristic = '7772e5db-3868-4112-a1a9-f2669d106bf3';

class FreedrumSensor {
  constructor(name) {
    this.device = null;
    this.onDisconnected = this.onDisconnected.bind(this);
    this.handleData = this.handleData.bind(this);
    this.name = name;
  }
  
  request() {
    let options = {
      "filters": [
          {"name": this.name},
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
      characteristic.addEventListener('characteristicvaluechanged', this.handleData);
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

  handleData(event){
      let data = event.target.value;
      // data will be a DataView type with byteLength of 5 because it contains 5 integers
      // e.g: [128,128,153,50,0]
      let command = data.getUint8(2);
      let note = data.getUint8(3);
      let volume = data.getUint8(4);

      // The volume property in Howler.js is normalize (between 0 - 1)
      // The velocity value in MIDI ranges from 0 - 127
      // To normalize, here's the equation:
      // z = (x - min(x)) / (max(x) - min(x))
      // z = (volume - Math.min(0,127)) / (Math.max(0,127) - Math.min(0,127));
      let normalizedVolume = (volume - Math.min(0,127)) / (Math.max(0,127) - Math.min(0,127));
  
      if(this.device.id === "XrnS1FRG/q/kM7ecsfErcg==" || this.device.id === "T/P6X0jDSadbdUXxRjjAVw=="){
          // sticks
      } 
      
      if(this.device.id === "6lASiqGNnfck4kO66nRlGw==" || this.device.id === "dJTKMPg47ZLgP4PAEBuWZw=="){
        // feet
      } 
  }

  handleDrumSticksEvents(command, note, volume){
    if(command === 153){
      if(note === 50){

      }

      if(note === 51){

      }
    }
  }

  handlePedalEvents(command, note, volume){
    if(command === 153){
      if(note === 44){
      }

      if(note === 46){
      }
    }
  }
}
  
var freeDrumStickOne = new FreedrumSensor("XrnS1FRG/q/kM7ecsfErcg=="); // FD2 v8
var freeDrumStickTwo = new FreedrumSensor("T/P6X0jDSadbdUXxRjjAVw=="); // FD2 v8
var freeDrumFootOne = new FreedrumSensor("6lASiqGNnfck4kO66nRlGw=="); // FD2 v9
var freeDrumFootTwo = new FreedrumSensor("dJTKMPg47ZLgP4PAEBuWZw=="); // FD2 v9

const sensors = [freeDrumStickOne, freeDrumStickTwo, freeDrumFootOne, freeDrumFootTwo];

document.querySelector('button').addEventListener('click', event => {
  let currentSensor = getSensorToConnect()
  currentSensor.request()
  .then(_ => currentSensor.connect())
  .then(_ => { currentSensor.getFreedrumData()})
  .catch(error => { console.log(error) });
});

const getSensorToConnect = () => {
  for(sensor of sensors){
    if(sensor.device === null){
      let currentSensor = sensor;
      return currentSensor;
    }
  }
}
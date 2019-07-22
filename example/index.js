let bluetoothLEMidi = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
let bleMidiCharacteristic = '7772e5db-3868-4112-a1a9-f2669d106bf3';

var cowbell = new Howl({src: ['../assets/cowbell.wav']});
var kick = new Howl({src: ['../assets/kick.wav']});
var snare = new Howl({src: ['../assets/snare.wav']});
var closedHiHat = new Howl({src: ['../assets/closed-hi-hat.wav']});
var bassDrum = new Howl({src: ['../assets/bass-drum.wav']});
var hiHatCymbal = new Howl({src: ['../assets/hi-hat-cymbal.mp3']});
var heavySnare = new Howl({src: ['../assets/heavy-snare.wav']});

class FreedrumStick {
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
        this.handleDrumSticksEvents(command, note, normalizedVolume);
      } 
      
      if(this.device.id === "6lASiqGNnfck4kO66nRlGw==" || this.device.id === "dJTKMPg47ZLgP4PAEBuWZw=="){
        this.handlePedalEvents(command, note, normalizedVolume);
      } 
  }

  handleDrumSticksEvents(command, note, volume){
    if(command === 153){
      if(note === 50){
        hiHatCymbal.play()
        hiHatCymbal.volume(volume);
        drawTriangle();
      }

      if(note === 51){
        heavySnare.play()
        heavySnare.volume(volume);
        drawCircle();
      }
    }
  }

  handlePedalEvents(command, note, volume){
    if(command === 153){
      if(note === 44){
        bassDrum.play()
        bassDrum.volume(volume);
        drawCircle();
      }

      if(note ===50){
        bassDrum.play()
        bassDrum.volume(volume);
        drawTriangle();
      }
    }
  }
}
  
var freeDrumStickOne = new FreedrumStick("XrnS1FRG/q/kM7ecsfErcg=="); // FD2 v8
var freeDrumStickTwo = new FreedrumStick("T/P6X0jDSadbdUXxRjjAVw=="); // FD2 v8
var freeDrumFootOne = new FreedrumStick("6lASiqGNnfck4kO66nRlGw=="); // FD2 v9
var freeDrumFootTwo = new FreedrumStick("dJTKMPg47ZLgP4PAEBuWZw=="); // FD2 v9

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
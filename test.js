let bluetoothLEMidi = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
let bleMidiCharacteristic = '7772e5db-3868-4112-a1a9-f2669d106bf3';

var cowbell = new Howl({
    src: ['assets/cowbell.wav']
});

var kick = new Howl({
    src: ['assets/kick.wav']
});

var snare = new Howl({
    src: ['assets/snare.wav']
});

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
    
        if(this.device.id === "XrnS1FRG/q/kM7ecsfErcg==" || this.device.id === "T/P6X0jDSadbdUXxRjjAVw=="){
            this.handleDrumSticksEvents(command, note, volume);
        } 
        
        if(this.device.id === "6lASiqGNnfck4kO66nRlGw==" || this.device.id === "dJTKMPg47ZLgP4PAEBuWZw=="){
            this.handlePedalEvents(command, note, volume);
        } 
    }

    handleDrumSticksEvents(command, note, volume){
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

    handlePedalEvents(command, note, volume){
        if(command === 153){
            if(note === 44 && volume > 30){
                kick.play()
                document.body.style.backgroundColor = 'green';
            }
    
            // if(note === 51 && volume > 50){
            //     snare.play()
            //     document.body.style.backgroundColor = 'purple';
            // }
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
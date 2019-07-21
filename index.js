/**
* @author Charlie Gerard / http://charliegerard.github.io
*/
  
var deviceName = "FD2 v8";
var deviceNameFoot = "FD2 v9";


let bluetoothLEMidi = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const button = document.getElementsByTagName('button')[0];

let cowbell = document.getElementsByTagName('audio')[0];
let snare = document.getElementsByTagName('audio')[1];

button.onclick = () => connect()

const connect = () => {
    return navigator.bluetooth.requestDevice({
    filters: [
        {name: deviceNameFoot},
        {services: [bluetoothLEMidi]}
    ],
    })
    .then(device => {
        console.log('Device discovered', device.name);
        console.log('Device discovered', device);
        return device.gatt.connect();
    })
    .then(server => {
        console.log('server device: '+ Object.keys(server.device));
        return server.getPrimaryService(bluetoothLEMidi);
    })
    .then(service => {
        return service.getCharacteristic('7772e5db-3868-4112-a1a9-f2669d106bf3');
    })
    .then(characteristic => characteristic.startNotifications())
    .then(characteristic => {
        characteristic.addEventListener('characteristicvaluechanged', handleData);
        return characteristic.readValue();
    })
    .catch(error => {console.log('error',error)})
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
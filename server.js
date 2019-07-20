/**
 * @author Charlie Gerard / https://charliegerard.github.io/
 */

var noble = require("noble-mac");

var deviceName = "FD2 v8";
let bluetoothLEMidi = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
let freedrums = '0e5a1523-ede8-4b33-a751-6ce34ec47c00';

/*
The freedrums service returns 4 services that I "think" relate to these 4 things.

orientation
drum conf
status
version - string value at 0
*/

var state = {};

function FreedrumsController(){
  noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
  });

  noble.on('discover', function(peripheral){
    if(peripheral.advertisement.localName === deviceName){
      console.log('peripheral id: ' + peripheral.id + ' found');
      console.log('Device name: ' + peripheral.advertisement.localName);
      noble.stopScanning();
    }

    explore(peripheral);
  });

  function explore(peripheral){
    peripheral.on('disconnect', function() {
      process.exit(0);
    });

    peripheral.connect(function(error){
      peripheral.discoverSomeServicesAndCharacteristics([bluetoothLEMidi], [], function(error, services, characteristics){
          characteristics[0].on("read", function(data, isNotification){

            // data is coming back as an array of 5 integers.
            // ex: [ 128, 128, 153, 42, 36 ]
            // [ Header byte, Timestamp byte, status byte, data byte, data byte]
            // We don't really care about header and timestamp so they are set to 128
            // Status is things like noteOn, noteOff, etc...
            // 153: noteOn
            // 137: noteOff
            // 176: Continuous controller / Control Change (CC) - always 16 or 24 == controller & controller value

            // data[3] is the MIDI note
            // data[4] is the velocity or volume

            if(data[2] === 153){
              let midiData = data.toJSON().data;
              let note = midiData[3];

              if(note === 50){ // 50 is high tom
                console.log('high tom')
              } else if (note === 57){ //57 is crash cymbal 2
                console.log('crash cymbal')
              } else if (note === 51){ // 51 is Ryde cymbal
                console.log("ryde cymbal")
              }
              
              // console.log('note on!!!! ', data.toJSON().data)
            }
            onStateChangeCallback(state);
          })

          characteristics[0].subscribe(function(err){
            console.log('subscribed')
          })
      })
    });
  }

  function onStateChangeCallback(){}

  return {
    onStateChange: function ( callback ) {
      onStateChangeCallback = callback;
    }
  }
}

FreedrumsController()

// module.exports = function(){
//   return DaydreamController();
// }


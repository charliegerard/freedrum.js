/**
 * @author Charlie Gerard / https://charliegerard.github.io/
*/

const noble = require("noble-mac");
const bluetoothLEMidi = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
let freedrums = '0e5a1523-ede8-4b33-a751-6ce34ec47c00';
/*
The freedrums service returns 4 services that I "think" relate to these 4 things.
  orientation
  drum conf
  status
  version - string value at 0
*/

var state = {};

function FreedrumsController(sensorId){
  noble.on('stateChange', function(state) {
    state === 'poweredOn' ? noble.startScanning() : noble.stopScanning();
  });

  noble.on('discover', function(peripheral){
    if(peripheral.id === sensorId || peripheral.advertisement.localName === sensorId){
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
          characteristics[0].on("read", function(event, isNotification){
            let data = event.toJSON().data;
            state = data;
            onStateChangeCallback(state);
          })

          characteristics[0].subscribe(function(err){
            console.log('subscribed')
          })
      })
    });
  }

  function onStateChangeCallback(e){
    return e;
  }

  return {
    onStateChange: function ( callback ) {
      onStateChangeCallback = callback;
    }
  }
}

module.exports = function(){
  return FreedrumsController();
}


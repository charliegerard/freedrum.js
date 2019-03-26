/**
 * @author Charlie Gerard / https://charliegerard.github.io/
 */

var noble = require("noble");

var daydreamDeviceName = "FD1 v7";
// var daydreamDeviceId = '0e5a1523-ede8-4b33-a751-6ce34ec47c00';
var daydreamDeviceId = '7c17f841b6744039891e50cb3ce98150';
// var daydreamPrimaryServiceUuid = "0000180f00001000800000805f9b34fb";
var daydreamPrimaryServiceUuid = "0e5a1523ede84b33a7516ce34ec47c00";
var mainService = "03b80e5aede84b33a7516ce34ec4c700";
var daydreamMainCharacteristicUuid = "0000000110001000800000805f9b34fb";

var batteryService = '180f';
var batteryChar = '2a19';

var generic = "0000180000001000800000805f9b34fb";

var state = {};

function DaydreamController(){
  noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
  });

  noble.on('discover', function(peripheral){
    if(peripheral.id === daydreamDeviceId || peripheral.advertisement.localName === daydreamDeviceName){
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
      peripheral.discoverSomeServicesAndCharacteristics(['0e5a1523ede84b33a7516ce34ec47c00'], [], function(error, services, characteristics){
        console.log(characteristics[2])
        // characteristics[0].discoverCharacteristics(['0e5a1525ede84b33a7516ce34ec47c00'], function(error, char){
          characteristics[0].on("read", function(data, isNotification){
            //orientation data?
            console.log('data: ', data.toJSON().data)
            // console.log('data', data)
            onStateChangeCallback(state);
          })

          characteristics[0].subscribe(function(err){
            console.log('subscribed')
          })

        // })
      })

      // peripheral.discoverServices(['0e5a1523ede84b33a7516ce34ec47c00'], function(error, services){

      //     if(services.length > 0){
      //         var primaryService = services[0];
      //         console.log('service', services)

      //         primaryService.discoverCharacteristics(['214f96ba37ba42b09658138de0f9afe7'], function(error, characteristics){
      //           var mainCharacteristic = characteristics[0];
      //           console.log(error)

      //           for(var i = 0; i < characteristics.length; i++){
      //             console.log('uuid', characteristics[i].uuid)
      //           }

      //           mainCharacteristic.on("read", function(data, isNotification){
      //             if(data){
      //               // console.log("battery level", data.toJSON().data[0])
      //             }
      //             onStateChangeCallback(state);
      //           });

      //           mainCharacteristic.subscribe(function(error) {
      //             console.log('daydream controller notifications on');
      //           });
      //         })
      //       }
      //   });
    });
  }

  function onStateChangeCallback(){}

  return {
    onStateChange: function ( callback ) {
      onStateChangeCallback = callback;
    }
  }
}

module.exports = function(){
  return DaydreamController();
}


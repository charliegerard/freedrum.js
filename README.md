# Freedrum.js

Play Air Drums and interact with the browser using the [Freedrum sensors](https://freedrum.rocks).

## Demo:

![demo](demo.gif)

Watch actual demo video [here](https://youtu.be/UrG_mlfvDjE).

## Current status:

Working but could be improved. More services could be added such as the one to get motion data but I don't have the time right now.

*The Web Bluetooth version will only work with browsers that support the [Web Bluetooth API](https://caniuse.com/#feat=web-bluetooth).*


## Installation

There are 2 ways to use Freedrum.js, either directly in the browser or as a Node.js package.

### Using web bluetooth

Add the following script tag to your HTML file:

```html
<script src="https://raw.githubusercontent.com/charliegerard/freedrum.js/master/freedrum.js"></script>
```

### Using Node.js

```js
npm install freedrum
```

## How to use

### Using web bluetooth:

Each sensor has a unique uuid you can use to determine which sensor you're trying to connect to:

```js
// These may be different.
// You can also find devices by name "FD2 v8" and "FD2 v9" and then look for their uuid.

/*
XrnS1FRG/q/kM7ecsfErcg==

T/P6X0jDSadbdUXxRjjAVw==

6lASiqGNnfck4kO66nRlGw==

dJTKMPg47ZLgP4PAEBuWZw==
*/
```

You need to start by instantiating a sensor:

```js
const freedrumSensor = new FreedrumSensor(uuid);

// example: new FreedrumSensor("XrnS1FRG/q/kM7ecsfErcg==");
```

Then, to connect, the web bluetooth API requires an input gesture by the user, in the following case, a click:

```js
const freeDrumStickOne = new FreedrumSensor("XrnS1FRG/q/kM7ecsfErcg==");

document.querySelector('button').addEventListener('click', event => {
  freeDrumStickOne.request()
  .then(_ => freeDrumStickOne.connect())
  .then(_ => freeDrumStickOne.setup())
  .then(characteristic => 
    characteristic.addEventListener('characteristicvaluechanged', (event) => 
      handleSensorData(event.target.value)))
  .catch(error => { console.log(error) });
});

const handleSensorData = data => {
  // data is of type DataView with byteLength of 5 because it contains 5 integers.
  // e.g: [128,128,153,50,0]
  // [Header byte, Timestamp byte, Status byte, Data byte, Data byte]
}
```

This will connect to the sensor, and subscribe to the changes of data coming from the `bluetoothLEMIDI` service and its characteristic.

You can try the demo in the example folder if you want. Turn on each sensor, click on the `connect` button and connect each sensor to the page.

---

### Using Node.js:

To use the module in your Node.js application, you need to start by importing it:

```js
const freedrumJS = require('freedrum');
```

To start using it, you need to pass a uuid:

```js
const sensorUuid = 'b50b6d66efb145f4b1c04f1dea0fbdb9';
const sensor = freedrumJS(sensorUuid);
```

If you don't know the uuid of your sensors yet, you can use their device name "FD2 v8" and "FD2 v9".

```js
const sensor = freedrumJS("FD2 v8");
```

And then to get the data, you need to call the following function:

```js
const sensor = freedrumJS("FD2 v8");
sensor.onStateChange(function(data){
  // do something with data
})
```



## The data

The data comes back as an array of 5 integers with the following format: 

```
[Header byte, Timestamp byte, Status byte, Data byte, Data byte]

// example: [128,128,143,44,90]
```

The header and timestamp byte are set to 128 but it doesn't seem to really matter as we don't need it.

The 3rd element is the status code representing the MIDI command, the 4th is the note and the 5th is the velocity we can use for volume.

```js
// example

// with WebBluetooth:
const handleSensorData = data => {
  let command = data.getUint8(2);
  let note = data.getUint8(3);
  let velocity = data.getUint8(4);
}

//With Node.js
sensor.onStateChange(function(data){
  let command = data[2];
  let note = data[3];
  let velocity = data.[4];
})
```

Depending on the audio library you'll use with it, you might want to normalize the velocity. To do this, you can use the following formula:

```js
// Example for Howler.js
// ----------------------
/*

The volume property in Howler.js is normalized (between 0 - 1)
The velocity value in MIDI ranges from 0 - 127

To normalize, here's the equation:
z = (x - min(x)) / (max(x) - min(x))

*/

let normalizedVolume = (velocity - Math.min(0,127)) / (Math.max(0,127) - Math.min(0,127));
```

### Status byte

The status byte represents commands such as noteOn, noteOff, etc...

* 153: noteOn
* 137: noteOff
* 176: Continuous controller / Control Change (CC) - (seem to  always return 16 or 24 / controller & controller value)


## Services and Characteristics available

I've mainly used the `bluetoothLEMidi` service but there are others available, including the `freedrums` service to get access to motion data.

More info on these docs:

* [Gist about Freedrums specs](https://gist.github.com/wvengen/7ebd29da38c08540832fb228c4628171)
* Some info on the [Freedrum forum](http://forum.freedrum.rocks/t/freedrum-midi-commands/15)

---

### Hope it helps! 💚
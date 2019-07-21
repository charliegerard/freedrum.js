# Freedrum.js

[WIP]

Play Air Drums and interact with the browser using the Freedrum controllers.

## Demo:


## Installation

### Using web bluetooth

Add the following script tag to your HTML file:

```html
<script src=""></script>
```

### Using Node.js

```js
npm install freedrum
```

## How to use

Each sensor has a unique uuid you can use to determine which sensor you're trying to connect to:

```
XrnS1FRG/q/kM7ecsfErcg==

T/P6X0jDSadbdUXxRjjAVw==

6lASiqGNnfck4kO66nRlGw==

dJTKMPg47ZLgP4PAEBuWZw==
```

To connect to a sensor, use the following:

```js
const freedrumSensor = new FreedrumSensor(uuid);

// example: new FreedrumSensor("XrnS1FRG/q/kM7ecsfErcg==");
```

This will connect to the sensor, and subscribe to the changes of data coming from the `bluetoothLEMIDI` service and its characteristic.

Once you're connected, you can call the following function to do what you want with the data:

```javascript
freedrumSensor.request()
  .then(_ => freedrumSensor.connect())
  .then(_ => { freedrumSensor.getFreedrumData()})
  .then(data => {
      // whatever you want with the data
  })
  .catch(error => { console.log(error) });
```

### With web bluetooth:

Try the demo in the example folder. Turn on each sensor, click on the `connect` button and connect each sensor to the page.



## The data

The data comes back as an array of 5 integers with the following format: 

```
[Header byte, Timestamp byte, Status byte, Data byte, Data byte]

// example: [128,128,143,44,90]
```

The header and timestamp byte are set to 128 but it doesn't really matter for this, we don't use that anyway.

The 3rd element is the status code, the 4th is the note and the 5th is the velocity.



## Services and Characteristics available
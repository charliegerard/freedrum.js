var daydream = require('./server.js')();

daydream.onStateChange(function(data){
    // if(data.isClickDown){
    //     console.log('clicking down');
    // } else {
    //     console.log('not cliking down');
    // }

    console.log(data);
})

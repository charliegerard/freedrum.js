var elem = document.getElementById('draw-animation');
var two = new Two({ width: window.innerWidth, height: window.innerHeight}).appendTo(elem);

document.addEventListener('keydown', e => {
    if(e.keyCode === 85){ //u
        drawCircle();
    } else if(e.keyCode === 81){ //q
        drawTriangle();
    }
})

const drawCircle = () => {
    var circle = two.makeCircle(window.innerWidth/2, window.innerHeight/2, window.innerWidth/2);
    circle.noFill();
    circle.stroke = "#ffffff";
    circle.linewidth = 20;
    circle.scale = 0;

    two.bind('update', function(frameCount) {
        if (circle.scale > 0.9) {
            two.remove(circle);
            two.pause();
        } else {
            var t = (1 - circle.scale) * 0.250;
            circle.scale += t;
            two.play();
        }
    }).play();
}

const drawTriangle = () => {
    var triangle = two.makePolygon(window.innerWidth/2, window.innerHeight/2, window.innerWidth/2, 3);
    triangle.scale = 1;
    triangle.fill = "hotpink";
    // triangle.noStroke();
    triangle.stroke = "cyan";
    triangle.linewidth = 30;

    two.bind('update', function(frameCount) {
        if (triangle.scale < 0.01) {
            two.remove(triangle);
            two.pause();
        } else {
            var t = triangle.scale * 0.250;
            triangle.scale -= t;
            two.play();
        }
    }).play();
}
let state = 0;
function setup(){
    createCanvas(windowWidth, windowHeight);
}

function welcomePage(){
    Text("welcome", 200, 200, 200, 200);
}
function draw(){
    background(220);
    if (state = 0){
        welcomePage();
    }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
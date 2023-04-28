// Module aliases
let Engine = Matter.Engine
let Render = Matter.Render
let Bodies = Matter.Bodies
let Composite = Matter.Composite
let MouseConstraint = Matter.MouseConstraint
let Mouse = Matter.Mouse
let Bounds = Matter.Bounds
let Events = Matter.Events

// Set up world, engine and render canvas
var engine = Engine.create();

var world = engine.world;

var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 850,
        height: 650,
        wireframes: false
    }
});

Render.run(render);

 // Add mouse constraint
 mouseConstraint = MouseConstraint.create(engine, {
    constraint: {
     render: {
        visible: true
        }
    }
 });
Composite.add(world, mouseConstraint);


// Create two bodies and barriers
let shape1 = Bodies.circle(535, 150, 25, {restitution: 0.5});
let shape2 = Bodies.circle(735, 50, 32, {restitution: 1});
let ground = Bodies.rectangle(425, 610, 850, 60, { isStatic: true });
let border2 = Bodies.rectangle(25, 306, 80, 542, {isStatic: true});
let border3 = Bodies.rectangle(835, 306, 80, 542, {isStatic: true});

// Add bodies to the world
Composite.add(world, [shape1, shape2, ground, border2, border3]);

let colorArray = ["pink", "blue", "purple", "red"];

let colorIndex = 0;
function changeColor(shape) {
    console.log(colorIndex)
    let color = colorArray[colorIndex];
    shape.render.fillStyle = color;
    colorIndex = (colorIndex + 1) % colorArray.length;
}

//Testing to see mouse and shape interaction
Events.on(mouseConstraint, 'mousedown', function(event) {
    let position = event.mouse.position;
    if (Bounds.contains(shape1.bounds, position)) {
        changeColor(shape1)
        //console.log(shape1)
    }
    if (Bounds.contains(shape2.bounds, position)) {
        changeColor(shape2)
        //console.log(shape2)
    }
});

frameRate = 1000 / 60;

// Create game loop (because Matter.Runner doesn't work with node.js)
setInterval(function () {
    Engine.update(engine, frameRate);
}, frameRate);
// Module aliases
let Engine = Matter.Engine
let Render = Matter.Render
let Bodies = Matter.Bodies
let Composite = Matter.Composite
let Constraint = Matter.Constraint
let MouseConstraint = Matter.MouseConstraint
let Mouse = Matter.Mouse
var Body = Matter.Body
let World = Matter.World


// Set up engine and renderer
var engine = Engine.create();

var world = engine.world;

var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        wireframes:false,
        // background: 'white'
        // wireframeBackground: false
    }
});

Render.run(render);

// function update() {
//     Engine.update(engine);
//     Render.run(render);
//     requestAnimationFrame(update);
// }

// requestAnimationFrame(update);


// Create canvas
// var canvas = document.createElement('canvas');
// document.body.appendChild(canvas);

//Mouse constraint
const mouse = Mouse.create(render.canvas),
mouseConstraintOptions = {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
};

let mouseConstraint = MouseConstraint.create(world, mouseConstraintOptions);

// Ground and border
let ground = Bodies.rectangle(425, 610, 850, 60, {isStatic: true});
let circle1 = Bodies.circle(42, 60, 85, mouse);
let border1 = Bodies.rectangle(425, 5, 850, 60, {isStatic: true});
let border2 = Bodies.rectangle(25, 306, 80, 542, {isStatic: true});
let border3 = Bodies.rectangle(835, 306, 80, 542, {isStatic: true});


Composite.add(world, [ground, circle1, border1, border2, border3]);



// Create game loop (because Matter.Runner doesn't work with node.js)
frameRate = 1000 / 60;
setInterval(function () {
    Engine.update(engine, frameRate);
}, frameRate);
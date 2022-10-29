// Module aliases
let Engine = Matter.Engine
let Render = Matter.Render
let Bodies = Matter.Bodies
let Composite = Matter.Composite
let Composites = Matter.Composites
let Constraint = Matter.Constraint
let Events = Matter.Events
let MouseConstraint = Matter.MouseConstraint
let Mouse = Matter.Mouse
var Body = Matter.Body
let World = Matter.World
let Boundary = Matter.Boundary

// Plugin
Matter.use(
    'matter-attractors' // PLUGIN_NAME
);

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

// Gravity
world.gravity.scale = 0;

// Create canvas
var canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// Canvas size
canvas.width = 850;
canvas.height = 650;

// Slider bar
let sliderValue = document.getElementById('mySlider');
let attractStrength = sliderValue.value
sliderValue.addEventListener('input', function () {
    attractStrength = sliderValue.value;
})

// Leanord Jones Potentials
function dist(body1, body2) {
    let x1 = body1.position.x
    let y1 = body1.position.y
    let x2 = body2.position.x
    let y2 = body2.position.y
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

let epsilon = .2
let sigma = 1
function lj_pot(body1, body2) {
    let distance = dist(body1, body2)
    return distance * epsilon * attractStrength
}

// Molecule types (calling them nucleotides for a snappy name, but this is generic)
let nucleotides = ["A","B"]
function randIndex(length) {
    return Math.floor(Math.random() * length);
}
function randNucleotide() {
    return nucleotides[randIndex(nucleotides.length)]
}

// Set up circles
let circleProperties = {
    plugin: {
        attractors: [
            function(otherBody, mainBody) {
                let strength = attractStrength // lj_pot(bodyA, bodyB)
                return {
                    x: (mainBody.position.x - otherBody.position.x) * (0.000001 * strength),
                    y: (mainBody.position.y - otherBody.position.y) * (0.000001 * strength),
                };
            }
        ]
    }
}
let numBodies = 10
var stack1 = Composites.stack(5, 6, 1, numBodies, 0, 0.5, function (x, y) {
    return Bodies.circle(25, 23, 25, circleProperties);
});
stack1.bodies.forEach(body => {
    body.n_type = randNucleotide()
    if (body.n_type) {
        if (body.n_type === 'A') {
            body.render.fillStyle = 'red'
        } else {
            body.render.fillStyle = 'blue'
        }
    }
})

// Ground and border
let ground = Bodies.rectangle(425, 610, 850, 60, {isStatic: true});
let border1 = Bodies.rectangle(425, 5, 850, 60, {isStatic: true});
let border2 = Bodies.rectangle(25, 306, 80, 542, {isStatic: true});
let border3 = Bodies.rectangle(835, 306, 80, 542, {isStatic: true});
Composite.add(world, [ground, border1, border2, border3]);

// Chain of molecules
Composites.chain(stack1, 0.5, 0, -0.5, 0, {stiffness: 1, length: 1, render: {type: 'line'}});
Composite.add(stack1, Constraint.create({
    bodyB: stack1.bodies[0],
    pointB: {x: -60, y: 25},
    pointA: {x: stack1.bodies[0].position.x, y: stack1.bodies[0].position.y},
    length: 50,
    stiffness: 0.5
}));
Composite.add(world, [stack1]);

// Create game loop (because Matter.Runner doesn't work with node.js)
frameRate = 1000 / 60;
setInterval(function () {
    Engine.update(engine, frameRate);
}, frameRate);
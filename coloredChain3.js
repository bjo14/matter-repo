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
let sliderAmount = sliderValue.value
sliderValue.addEventListener('input', function () {
    sliderAmount = sliderValue.value;
})

// Leanord Jones Potentials
function dist(body1, body2) {
    let x1 = body1.position.x
    let y1 = body1.position.y
    let x2 = body2.position.x
    let y2 = body2.position.y
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}


// Molecule types (calling them nucleotides for a snappy name, but this is generic)
let nucleotides = ["Red","Blue", "Yellow", "Green"]
function randIndex(length) {
    return Math.floor(Math.random() * length);
}
function randNucleotide() {
    return nucleotides[randIndex(nucleotides.length)]
}

//Connections based on AUGC RNA
function interMolecularStrength(type1, type2) {
    console.log(type1, type2)
    if ((type1 === "Red" && type2 === "Blue") || (type1 === "Blue" && type2 === "Red")) {
       return -.000001
    } else if ((type1 === "Yellow" && type2 === "Blue") || (type1 === "Blue" && type2 === "Yellow")) {
        return -.000009
    } else if ((type1 === "Red" && type2 === "Green") || (type1 === "Green" && type2 === "Red")) {
        return -.00009
    } else if ((type1 === "Red" && type2 === "Yellow") || (type1 === "Yellow" && type2 === "Red")) {
        return .00009
    } else if ((type1 === "Green" && type2 === "Yellow") || (type1 === "Yellow" && type2 === "Green")) {
        return .00009
    } else if ((type1 === "Green" && type2 === "Blue") || (type1 === "Blue" && type2 === "Green")) {
        return .00009
    } else {
        return 0
    }
}

// Set up circles
let circleProperties = {
    plugin: {
        attractors: [
            function(otherBody, mainBody) {
                let strength = interMolecularStrength(otherBody.n_type, mainBody.n_type)
                console.log(sliderAmount * strength);
                return {
                    x: (mainBody.position.x - otherBody.position.x) * (sliderAmount * strength),
                    y: (mainBody.position.y - otherBody.position.y) * (sliderAmount * strength),
                };
            }
        ]
    }
}

//Different strand combos: ["Red", "Red", "Green", "Green"] , ["Red", "Red", "Blue", "Blue"], ["Yellow", "Yellow", "Blue", "Blue"]
//["Red", "Red", "Yellow", "Yellow"], ["Yellow", "Yellow", "Green", "Green"], ["Blue", "Blue", "Green", "Green"]
//let sequence = ["Red", "Red", "Red", "Green", "Green", "Green", "Blue", "Blue", "Yellow", "Yellow"]

let sequence = ["Red", "Green","Red", "Green", "Yellow", "Green", "Red", "Blue", "Red", "Blue"]

var stack1 = Composites.stack(5, 6, 1, sequence.length, 0, 0.5, function (x, y) {
    return Bodies.circle(25, 23, 25, circleProperties);
});

let i = 0;
stack1.bodies.forEach(body => {
    //console.log(body.id);
    // body.n_type = randNucleotide()
   body.n_type = sequence[i++]
    if (body.n_type) {
        if (body.n_type === 'Red') {
            body.render.fillStyle = 'red'
        } else if (body.n_type === 'Blue') {
            body.render.fillStyle = 'blue'
        } else if (body.n_type === 'Yellow') {
            body.render.fillStyle = 'yellow'
        } else if (body.n_type === 'Green') {
            body.render.fillStyle = 'green'
        }

    }
})

const mouse = Mouse.create(render.canvas);
const mouseConstraintOptions = {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
}
let mouseConstraint = MouseConstraint.create(world, mouseConstraintOptions);

// Ground and border
let ground = Bodies.rectangle(425, 610, 850, 60, {isStatic: true});
let border1 = Bodies.rectangle(425, 5, 850, 60, {isStatic: true});
let border2 = Bodies.rectangle(25, 306, 80, 542, {isStatic: true});
let border3 = Bodies.rectangle(835, 306, 80, 542, {isStatic: true});
Composite.add(world, [ground, border1, border2, border3, mouseConstraint]);

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
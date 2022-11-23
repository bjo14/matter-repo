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

const betweenCircleNumPixels = 55
function lj_pot(body1, body2, epsilon = 1, sigma = 100) {
    if (body1 === body2) {
        return 0
    }
    // TODO: Deal with .00001 which is just a hack to avoid divide by 0 nans
    // TODO: Scale everything by pixel
    let distance = (dist(body1, body2) + .0001) / betweenCircleNumPixels
    let lj = 4 * epsilon * ((Math.pow(sigma/distance, 12)) - Math.pow(sigma/distance, 6))
    //console.log(lj)
    return lj
}

// Molecule types (calling them nucleotides for a snappy name, but this is generic)
let nucleotides = ["Red","Blue", "Yellow", "Green"]
function randIndex(length) {
    return Math.floor(Math.random() * length);
}
function randNucleotide() {
    return nucleotides[randIndex(nucleotides.length)]
}

/**
 * For a given pair of molecule types, return epsilon and sigma for leanord jones
 */
function interMolecularStrength(type1, type2) {
    console.log(type1, type2)
    if (type1 === "Red" && type2 ==="Blue") {
       return [-.35, -.35]
    } else if (type1 === "Yellow" && type2 === "Blue") {
        return [.35, .35]
    } else if (type1 === "Red" && type2 === "Green") {
        return [.35, .35]
    } else if (type1 === "Red" && type2 === "Yellow") {
        return [-.35, -.35]
    } else if (type1 === "Green" && type2 === "Yellow") {
        return [-.35, -.35]
    } else if (type1 === "Green" && type2 === "Blue") {
        return [-.35, -.35]
    } else if (type1 === "Green" && type2 === "Blue") {
        return [-.35, -.35]
    } else {
        return [0, 0]
    }
}

// Set up circles
let circleProperties = {
    plugin: {
        attractors: [
            function(otherBody, mainBody) {
                let bondStrength = interMolecularStrength(otherBody.n_type, mainBody.n_type)
                //console.log("Bond strength:", bondStrength);
                let strength = lj_pot(mainBody, otherBody, bondStrength[0], bondStrength[1])
                //console.log(strength);
                return {
                    x: (mainBody.position.x - otherBody.position.x) * (attractStrength * strength * 0.05),
                    y: (mainBody.position.y - otherBody.position.y) * (attractStrength * strength * 0.05),
                };
            }
        ]
    }
}
let numBodies = 6
var stack1 = Composites.stack(5, 6, 1, numBodies, 0, 0.5, function (x, y) {
    return Bodies.circle(25, 23, 25, circleProperties);
});
// TODO: Add one more type, and make type names match colors
let sequence = ["Yellow", "Red", "Red", "Green", "Green", "Blue"]
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

// TODO: Figure out mouse stuff. Goal for now is to know what body we have clicked on
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

//Work in progress: mouse interaction
    document.addEventListener('click', function(event){
       // console.log(mouseConstraint)
        if (mouseConstraint.body != null) {
             mouseConstraint.body.render.fillStyle = 'pink'
             console.log('hi');
        }
    })


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
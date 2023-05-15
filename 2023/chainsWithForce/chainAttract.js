// Module aliases
let Engine = Matter.Engine
let Render = Matter.Render
let Bodies = Matter.Bodies
let Composite = Matter.Composite
let Composites = Matter.Composites
let Constraint = Matter.Constraint
let MouseConstraint = Matter.MouseConstraint
let Mouse = Matter.Mouse
let Bounds = Matter.Bounds
let Events = Matter.Events

// Plug-in
Matter.use(
    'matter-attractors' // PLUGIN_NAME
);

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

// Gravity
world.gravity.scale = 0;

// Slider bar for user interaction for attraction function
let sliderValue = document.getElementById('sliderValue');
let sliderAmount = sliderValue.value
sliderValue.addEventListener('input', function () {
    sliderAmount = sliderValue.value;
})

// Color Interactions
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

// Binary value that determines attraction/repulsion
let attract = true;

// Function that creates attraction interactions and assigns values based on slider input
let shapeAttract = {
    plugin: {
        attractors: [
            function(otherBody, mainBody) {
                let strength = interMolecularStrength(otherBody.nType, mainBody.nType)
                console.log(sliderAmount * strength);
                return {
                    x: (mainBody.position.x - otherBody.position.x) * (sliderAmount * strength),
                    y: (mainBody.position.y - otherBody.position.y) * (sliderAmount * strength),
                };
            }
        ]
    }
}

 // Add mouse constraint
 mouseConstraint = MouseConstraint.create(engine, {
    constraint: {
     render: {
        visible: true
        }
    }
 });
Composite.add(world, mouseConstraint);

// Creates a stack of circles
let stack = Composites.stack(44, 44, 2, 2, 0.1, 0.1, function(){
    let circleBodies = Bodies.circle(235, 150, 25, shapeAttract);
    circleBodies.render.fillStyle = "White";
    circleBodies.nType = "White";
    return circleBodies;
})

// Function that changes color of shapes
let colorArray = ["Red", "Blue", "Yellow", "Green"];
let colorIndex = 0;
function changeColor(shape) {
    console.log(colorIndex)
    let color = colorArray[colorIndex];
    shape.render.fillStyle = color;
    shape.nType = color
    colorIndex = (colorIndex + 1) % colorArray.length;
}

// Mouse handler that executes color function when circle is clicked
stack.bodies.forEach(function(body) {
    Events.on(mouseConstraint, 'mouseup', function(event) {
        let position = event.mouse.position;
        if (Bounds.contains(body.bounds, position)) {
            changeColor(body);
        }
    });
});

// Creates constraints between each circle created in the stack function
let chain = Composites.chain(stack, 0.5, 0.2, 0.1, 0.5,{stiffness: 0.5, length: 1, render: {type: 'line'}});
Composite.add(stack, Constraint.create({
    bodyB: stack.bodies[0],
    pointA: {x: 60, y: 40},
    length: 100,
    stiffness: 0.5
}));

// Create two bodies and barriers
let ground = Bodies.rectangle(425, 610, 850, 60, { isStatic: true });
let border1 = Bodies.rectangle(425, 5, 850, 60, {isStatic: true});
let border2 = Bodies.rectangle(25, 306, 80, 542, {isStatic: true});
let border3 = Bodies.rectangle(835, 306, 80, 542, {isStatic: true});

// Add bodies to the world
Composite.add(world, [ground, border1, border2, border3, stack]);

frameRate = 1000 / 60;

// Create game loop (because Matter.Runner doesn't work with node.js)
setInterval(function () {
    Engine.update(engine, frameRate);
}, frameRate);
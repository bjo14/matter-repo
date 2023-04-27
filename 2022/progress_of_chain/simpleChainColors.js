// Module aliases
let Engine = Matter.Engine
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

Matter.use(
    'matter-attractors' // PLUGIN_NAME
);

// Create an engine
var engine = Engine.create();
var world = engine.world;

// Gravity 
world.gravity.scale = 0;


// Create canvas
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Canvas size
canvas.width = 850;
canvas.height = 650;

// Render function
let render = function renderFunction() {
    let bodies = Composite.allBodies(world);

    window.requestAnimationFrame(render);

    // Chooses background color of canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Rendering canvas and bodies
    ctx.beginPath();

    for (let i = 0; i < bodies.length; i += 1) {
        let vertices = bodies[i].vertices;

        ctx.moveTo(vertices[0].x, vertices[0].y);
        //ctx.render = bodies[i].render;

        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }

        ctx.lineTo(vertices[0].x, vertices[0].y);

//Makes all bodies one color


            if (bodies[i].label === 'circle') {
                    ctx.fillStyle = 'blue'
                    ctx.fill()
        
             } else {
                ctx.fillStyle = 'white'
                ctx.fill()
             }


// Attempt at coloring circles

        //     let circleBodies = Composite.allBodies(stack1);
        //     for (let i = 0; i < numBodies; i += 1) {
        //         if (i < 3) {
        //             ctx.arc(circleBodies[i].position.x, circleBodies[i].position.y, 25, 0, 2 * Math.PI);
        //             ctx.fillStyle = 'blue'
        //             ctx.fill()
        //         }
        //         else if (i < 6) {
        //             ctx.arc(circleBodies[i].position.x, circleBodies[i].position.y, 25, 0, 2 * Math.PI);
        //             ctx.fillStyle = 'yellow'
        //             ctx.fill()
        //         }
        //         else if (i < numBodies) {
        //             ctx.arc(circleBodies[i].position.x, circleBodies[i].position.y, 25, 0, 2 * Math.PI);
        //             ctx.fillStyle ='pink'
        //             ctx.fill()
        //         }
        //     }
        //     ctx.closePath();
    }
    

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.stroke();
};
render();

let sliderValue = document.getElementById('mySlider');
let attractStrength = sliderValue.value
sliderValue.addEventListener('input', function () {
    attractStrength = sliderValue.value;
})

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
    return -(distance * epsilon * sigma) * attractStrength 
}

let circleProperties = {
    label: 'circle',
    plugin: {
        attractors: [
            function(otherBody, mainBody) {
                if (attractStrength >= 0) {
                    bodyA = otherBody;
                    bodyB = mainBody;
                }
                else {
                    bodyA = mainBody;
                    bodyB = otherBody;
                }
                let strength = lj_pot(bodyA, bodyB)
                console.log(strength);
                return {
                    x: (bodyA.position.x - bodyB.position.x) * (0.0000001 * strength),
                    y: (bodyA.position.y - bodyB.position.y) * (0.0000001 * strength),
                };
            }
        ]
    }
}
let numBodies = 10
var stack1 = Composites.stack(5, 6, 1, numBodies, 0, 0.5, function (x, y) {
    return Bodies.circle(25, 23, 25, circleProperties);
});


stack1.label = 'chain';

// let circleBodies = Composite.allBodies(stack1);
// for (let i = 0; i < numBodies; i += 1) {
//     if (i < 3) {
//         circleBodies[i].render.fillStyle = 'blue'
//     }
//     else if (i < 6) {
//         circleBodies[i].render.fillStyle = 'yellow'
//     }
//     else if (i < numBodies) {
//         circleBodies[i].render.fillStyle = 'pink'
//     }

//  }

// let circleBodies = Composite.allBodies(stack1);
// for (let i = 0; i < numBodies; i += 1) {
//     if (i < 5) {
//         //ctx.arc(circleBodies[i].position.x, circleBodies[i].position.y, 25, 0, 2 * Math.PI);
//         ctx.fillStyle = 'blue'
//         ctx.fill()
//     }
//     else if (i < numBodies) {
//         //ctx.arc(circleBodies[i].position.x, circleBodies[i].position.y, 25, 0, 2 * Math.PI);
//         ctx.fillStyle ='pink'
//         ctx.fill()
//     }
// }


Composites.chain(stack1, 0.5, 0, -0.5, 0, {stiffness: 1, length: 1, render: {type: 'line'}});

Composite.add(stack1, Constraint.create({
    bodyB: stack1.bodies[0],
    pointB: {x: -60, y: 25},
    pointA: {x: stack1.bodies[0].position.x, y: stack1.bodies[0].position.y},
    length: 50,
    stiffness: 0.5,
}));

let ground = Bodies.rectangle(425, 610, 850, 60, {isStatic: true});
let border1 = Bodies.rectangle(425, 5, 850, 60, {isStatic: true});
let border2 = Bodies.rectangle(25, 306, 80, 542, {isStatic: true});
let border3 = Bodies.rectangle(835, 306, 80, 542, {isStatic: true});

Composite.add(world, [stack1, ground, border1, border2, border3]);

frameRate = 10;
// frameRate = 1000 / 60;

// Create game loop (because Matter.Runner doesn't work with node.js)
setInterval(function () {
    Engine.update(engine, frameRate);
}, frameRate);
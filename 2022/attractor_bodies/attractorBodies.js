// Module aliases
let Engine = Matter.Engine
let Bodies = Matter.Bodies
let Composite = Matter.Composite
let Events = Matter.Events
let MouseConstraint = Matter.MouseConstraint
let Mouse = Matter.Mouse
var Body = Matter.Body

Matter.use(
    'matter-attractors' // PLUGIN_NAME
    );

// Create an engine
const engine = Engine.create();
const world = engine.world;

// Gravity 
world.gravity.scale = 0;

// Boolean that determines attractor or repeller
let attract = true;

const button1 = document.getElementById('attracts');
const button2 = document.getElementById('repels');

button1.addEventListener('click', function () {
    attract = true;
})

button2.addEventListener('click', function () {
    attract = false;
})


// Create canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
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
        ctx.render = bodies[i].render;

        for (let j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }

        ctx.lineTo(vertices[0].x, vertices[0].y);
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'pink';
    ctx.stroke();
};
render();

// Attracting/repelling button and slider controls

let sliderValue = document.getElementById('mySlider');

let attractStrength = sliderValue.value;

sliderValue.addEventListener('input', function () {
    sliderAmount = sliderValue.value;
})

let shape1options = {
    plugin: {
        attractors: [
          function(otherBody, mainBody) {
            if (attract) {
                bodyA = otherBody;
                bodyB = mainBody;
            }
            else {
                bodyA = mainBody;
                bodyB = otherBody;
            }
            return {
              x: (bodyA.position.x - bodyB.position.x) * (0.000001 * sliderAmount),
              y: (bodyA.position.y - bodyB.position.y) * (0.000001 * sliderAmount),
            };
          }

        ]
      }
}

// Create two bodies and a ground
let shape1 = Bodies.circle(350, 250, 45, shape1options);
let shape2 = Bodies.circle(250, 230, 55);
let ground = Bodies.rectangle(425, 610, 850, 60, { isStatic: true });
let border1 = Bodies.rectangle(425,5, 850, 60, { isStatic: true });
let border2 = Bodies.rectangle(25, 306, 80, 542, { isStatic: true });
let border3 = Bodies.rectangle(835, 306, 80, 542, { isStatic: true });

// Mouse control
const mouse = Mouse.create(canvas);
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

// Add bodies to the world
Composite.add(world, [shape1, shape2, ground, border1, border2, border3, mouseConstraint]);

Events.on(engine, 'afterUpdate', function() {
    if (!mouse.position.x) {
        return;
    }

    // Smoothly move the attractor body towards the mouse
    Body.translate(shape1, {
        x: (mouse.position.x - shape1.position.x) * 0.25,
        y: (mouse.position.y - shape1.position.y) * 0.25
    });
});

frameRate = 1000 / 60;

// Create game loop (because Matter.Runner doesn't work with node.js)
setInterval(function () {
    Engine.update(engine, frameRate);
}, frameRate);
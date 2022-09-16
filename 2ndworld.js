// module aliases
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

// create an engine
const engine = Engine.create();

//gravity
const world = engine.world; 
world.gravity.scale = 0;

let attract = true;

//create canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// canvas size
canvas.width = 850;
canvas.height = 650;

//render function
let render = function renderFunction() {
    let bodies = Composite.allBodies(world);

    window.requestAnimationFrame(render);

    // Chooses background color of canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

let shape1options = {
    plugin: {
        attractors: [
          function(body2, mainBody) {
            if (attract) {
                bodyA = body2;
                bodyB = mainBody;
            }
            else {
                bodyA = mainBody;
                bodyB = body2;
            }
            return {
              x: (bodyA.position.x - bodyB.position.x) * 1e-5,
              y: (bodyA.position.y - bodyB.position.y) * 1e-5,
            };
          }
        ]
      }
}

// create two bodies and a ground
let shape1 = Bodies.circle(350, 250, 45, shape1options);
let shape2 = Bodies.circle(250, 230, 55);
let ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

//mouse control
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

// add bodies to the world
Composite.add(world, [shape1, shape2, ground, mouseConstraint]);

Events.on(engine, 'afterUpdate', function() {
    if (!mouse.position.x) {
        return;
    }

    // smoothly move the attractor body towards the mouse
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
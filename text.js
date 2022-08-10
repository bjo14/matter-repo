// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    MouseConstraint = Matter.MouseConstraint;

// create an engine
var engine = Engine.create();

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Canvas Size
canvas.width = 850;
canvas.height = 650;

// create a renderer
// var render = Render.create({
//     element: document.body,
//     engine: engine
// });
let render = function renderFunction() {
    let bodies = Composite.allBodies(engine.world);

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

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();
};
render();

let shapeoptions = {
    friction: 0.4,
    frictionAir: 0.4
}

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
var shape = Bodies.polygon(300, 120, 5, 50, shapeoptions);
var shape2 = Bodies.circle(350, 250, 85);
var mouse = MouseConstraint.create(engine);

boxA.isStatic = true;

// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB, ground, shape, shape2, mouse]);

frameRate = 1000 / 60;

// Create game loop (because Matter.Runner doesn't work with node.js)
setInterval(function () {
    Engine.update(engine, frameRate);
}, frameRate);

// run the renderer
// Render.run(render);

// create runner
// var runner = Runner.create();

// run the engine
// Runner.run(runner, engine);
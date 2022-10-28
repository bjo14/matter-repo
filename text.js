// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    Common = Matter.Common,
    Body = Matter.Body;

Matter.use(
    'matter-attractors' // PLUGIN_NAME
    );


// create an engine
var engine = Engine.create();

engine.world.gravity.scale = 0;

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

// categories
// var categories = 0x0001,
//     pinkCategory = 0x0003,
//     blueCategory = 0x0005,
//     whiteCategory = 0x0007;

// var pinkColor = '#ffc0cb',
//     blueColor = '#add8e6',
//     whiteColor = '#ffffff';

// Composite.add(engine.world, Composites.stack(100, 150, 3, 3, 12, 12, function(x, y, row){
//         var category = whiteCategory, color = whiteColor;

//         if (row > 3) {
//             category = blueCategory
//             color = blueColor;
//         }

//         return Bodies.polygon(x, y, 10, 45, {
//             collisionFilter: {
//                 category: category
//             },
//             render: {
//                 strokeStyle: color,
//                 fillStyle: 'transparent',
//                 lineWidth: 3
//             }
//         })

// }));

// Composite.add(engine.world, Bodies.circle(150, 60, 10, {
//     collisionFilter: {
//         mask: categories | pinkCategory
//     },
//     render: {
//         fillStyle: pinkColor
//     }
// }));

// Composite.add(engine.world, Bodies.circle(150, 60, 10, {
//     collisionFilter: {
//         mask: categories | blueCategory
//     },
//     render: {
//         fillStyle: blueColor
//     }
// }));

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
var shape = Bodies.polygon(300, 120, 5, 50, shapeoptions);
var shape2 = Bodies.circle(350, 250, 85);

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

var mouseConstraint = MouseConstraint.create(engine, mouseConstraintOptions);

boxA.isStatic = true;

// add all of the bodies to the world
//Composite.add(engine.world, [boxA, boxB, ground, shape, shape2, mouseConstraint]);
Composite.add(engine.world, [ground]);

frameRate = 1000 / 60;

// Events.on(mouseConstraint, 'enddrag', function (event){
//     event.body.isStatic = true
// });

// Events.on(mouseConstraint, 'startdrag', function (event) {
//     if (event.body !== ground) {
//         event.body.isStatic = false;
//     }
// });

  // create a body with an attractor
  var attractiveBody = Bodies.circle(
    canvas.width / 2,
    canvas.height / 2,
    50, 
    {
    isStatic: true,

    // example of an attractor function that 
    // returns a force vector that applies to bodyB
    plugin: {
      attractors: [
        function(bodyA, bodyB) {
          return {
            x: (bodyA.position.x - bodyB.position.x) * 1e-6,
            y: (bodyA.position.y - bodyB.position.y) * 1e-6,
          };
        }
      ]
    }
  });

  Composite.add(engine.world, attractiveBody);

  // add some bodies that to be attracted
  for (var i = 0; i < 150; i += 1) {
    var body = Bodies.polygon(
      Common.random(0, canvas.width), 
      Common.random(0, canvas.height),
      Common.random(1, 5),
      Common.random() > 0.9 ? Common.random(15, 25) : Common.random(5, 10)
    );

    Composite.add(engine.world, body);
  }

  Events.on(engine, 'afterUpdate', function() {
    if (!mouse.position.x) {
      return;
    }

    // smoothly move the attractor body towards the mouse
    Body.translate(attractiveBody, {
        x: (mouse.position.x - attractiveBody.position.x) * 0.25,
        y: (mouse.position.y - attractiveBody.position.y) * 0.25
    });
});

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
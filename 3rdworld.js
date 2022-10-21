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
const engine = Engine.create();
const world = engine.world;
var particles = [];
var boundaries = [];
// Gravity 
world.gravity.scale = 0;

function setup() {
    createCanvas(400, 400);
    engine = Engine.create();
    world = engine.world;
    //Engine.run(engine);
  
  function draw() {
    background(51);
    Engine.update(engine);
    for (var i = 0; i < boundaries.length; i++) {
      boundaries[i].show();
    }
  
    for (var i = 0; i < particles.length; i++) {
      particles[i].show();
    }
  }
}

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
    attractStrength = sliderValue.value;
})

function dist(body1, body2) {
    let x1 = body1.position.x
    let y1 = body1.position.y
    let x2 = body2.position.x
    let y2 = body2.position.y
    return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
}

let epsilon = .2
let sigma = 1

function lj_pot(body1, body2) {
    let distance = dist(body1, body2)
    return distance * epsilon * attractStrength
}

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
            let strength = lj_pot(bodyA, bodyB)
            return {
                x: (bodyA.position.x - bodyB.position.x) * (0.000001 * strength),
                y: (bodyA.position.y - bodyB.position.y) * (0.000001 * strength),
            };
          }

        ]
      }
}

//1st way of chain
var group = Body.nextGroup(true);
var stack1 = Composites.stack(5,6,1,7,0,0.5, function(x, y){
    return Bodies.circle(25, 23, 25, { label: 'label_name' });
});

Composites.chain(stack1, 0.5, 0, -0.5, 0, { stiffness: 1, length: 1, render: { type: 'line' } });

Composite.add(stack1, Constraint.create({ 
    bodyB: stack1.bodies[0],
    pointB: { x: -60, y: 25 },
    pointA: { x: stack1.bodies[0].position.x, y: stack1.bodies[0].position.y },
    length: 50,
    stiffness: 0.5
}));


group = Body.nextGroup(true);

//2nd way of chain

//Fix the first particle in the space, with connected particles

function Particle(x, y, r, fixed) {
    var options = {
      friction: 0,
      restitution: 0.95,
      isStatic: fixed
      
    };
    this.body = Bodies.circle(x, y, r, options);
    this.r = r;
    World.add(world, this.body);
  }

//Loop that creates a set of particles

  var prev = null;
  for (var x = 200; x < 400; x += 20) {
    var fixed = false;
    if (!prev) {
      fixed = true;
    }
   
    var p = new Particle(x, 100, 5, fixed);
    particles.push(p);

//Connecting the particles to each other
  
    if (prev) {
      var options = {
        bodyA: p.body,
        bodyB: prev.body,
        length: 20,
        stiffness: 0.4, 
        plugin: {
             attractors: [
               function(p, prev) {
                 if (attract) {
                     bodyA = p.body;
                     bodyB = prev.body;
                 }
                 else {
                  bodyA = prev.body,
                  bodyB = p.body
                 }
                 strength = lj_pot(bodyA, bodyB)
                 return {
                     x: (bodyA.position.x - bodyB.position.x) * (0.000001 * strength),
                     y: (bodyA.position.y - bodyB.position.y) * (0.000001 * strength)
                 }
               }
     
             ]
           }
          
    };
      var constraint = Constraint.create(options);
      World.add(world, constraint);
    }

    prev = p;
  }

// Create two bodies and a ground
let shape1 = Bodies.circle(350, 250, 45, shape1options); //shape1options
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
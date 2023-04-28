// Module aliases
let Engine = Matter.Engine
let Render = Matter.Render
let Bodies = Matter.Bodies
let Composite = Matter.Composite
let Composites = Matter.Composites
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

// Binary value that determines attraction/repulsion
let attract = true;

// Function that creates attraction interactions and assigns values based on slider input
let shapeAttract = {
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
              x: (bodyA.position.x - bodyB.position.x) * (sliderAmount * 1e-6),
              y: (bodyA.position.y - bodyB.position.y)* (sliderAmount * 1e-6),
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
    return Bodies.circle(235, 150, 25, shapeAttract);
})
//console.log(stack);

// Creates constraints between each circle created in the stack function
let chain = Composites.chain(stack, 0.5, 0.2, 0.1, 0.5);

// Create two bodies and barriers
let ground = Bodies.rectangle(425, 610, 850, 60, { isStatic: true });
let border1 = Bodies.rectangle(425, 5, 850, 60, {isStatic: true});
let border2 = Bodies.rectangle(25, 306, 80, 542, {isStatic: true});
let border3 = Bodies.rectangle(835, 306, 80, 542, {isStatic: true});

// Add bodies to the world
Composite.add(world, [ground, border1, border2, border3, stack]);

// Function that changes color of shapes
let colorArray = ["pink", "blue", "purple", "red"];
let colorIndex = 0;
function changeColor(shape) {
    console.log(colorIndex)
    let color = colorArray[colorIndex];
    shape.render.fillStyle = color;
    colorIndex = (colorIndex + 1) % colorArray.length;
}

// Mouse handler that executes color function when circle is clicked
stack.bodies.forEach(function(body) {
    Events.on(mouseConstraint, 'mousedown', function(event) {
        let position = event.mouse.position;
        if (Bounds.contains(body.bounds, position)) {
            changeColor(body);
            //console.log(body);
        }
    });
});

frameRate = 1000 / 60;

// Create game loop (because Matter.Runner doesn't work with node.js)
setInterval(function () {
    Engine.update(engine, frameRate);
}, frameRate);
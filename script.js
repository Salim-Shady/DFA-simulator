var canvas = document.getElementById('canvas');

var nodesHTML = [];
var nodesObjects = [];
var makeNode = document.getElementById('makeNode');
createNode(true, 30, 150);

var selectedNode = null;
var droppedNode = null;

makeNode.addEventListener("click", function() {
  createNode(false);
});

//creates a new node
function createNode(accepting, nodeX, nodeY) {

  //creates and adds to nodes lists for objects
  var node =  new Node(accepting, nodesHTML.length);
  nodesObjects.push(node);

  var nodeVis = createNodeVis(node, nodeX, nodeY);

  canvas.appendChild(nodeVis);

  //adds to nodes list for html elements
  nodesHTML.push(nodeVis);
  return node;
}//createNode

//creates the graphics for the node
function createNodeVis(node, nodeX, nodeY) {
  var radius = 20;

  //checks if node coords are empty
  if (!nodeX || !nodeY) {
    nodeY = ((Math.random()*200) + 50);
    nodeX = ((Math.random()*200) + 50);
  }

  //set visuals for the node
  var graphic = document.createElementNS("http://www.w3.org/2000/svg", "g")
  var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
  var text =  document.createElementNS("http://www.w3.org/2000/svg","text");

  //circle for node visuals
  circle.setAttribute("cx", nodeX);
  circle.setAttribute("cy", nodeY);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", "rgba(0,0,0,0.3)");
  circle.setAttribute("stroke", "");
  circle.setAttribute("class", 'draggable');

  //text within the node
  text.setAttribute("x",nodeX-3);
  text.setAttribute("y",nodeY+5);
  text.setAttribute("fill", "white");
  text.innerHTML = node.id;

  //add the circle and text to graphic
  graphic.appendChild(circle);
  graphic.appendChild(text);
  graphic.setAttribute("id", node.id);

  graphic.addEventListener('mousedown', function(e) {
    console.log(e.ctrlKey);
    e.preventDefault();
    if (!e.ctrlKey) {
      selectedNode = e.target.parentNode;
    }
  });

  graphic.addEventListener('mouseup', function(e) {
    if (!e.ctrlKey) {
      createCon(e);
    }
  });

  return graphic;
}

function moveNode(nodeH, x, y) {
  nodeH.childNodes[0].setAttribute("cx", x);
  nodeH.childNodes[0].setAttribute("cy", y);

  nodeH.childNodes[1].setAttribute("x", x-3);
  nodeH.childNodes[1].setAttribute("y", y+5);
}

function createCon(e) {
  droppedNode = e.target.parentNode;
  if (selectedNode && droppedNode) {
    var selectedNodeObj = nodesObjects[selectedNode.id];
    var droppedNodeObj = nodesObjects[droppedNode.id];

    selectedNodeObj.addOutput(droppedNodeObj, 0);
    // droppedNodeObj.addInput(selectedNodeObj.id, selectedNodeObj.outputs.length-1);

    console.log(selectedNodeObj, droppedNodeObj);
  }
  selectedNode = null;
  droppedNode = null;
}

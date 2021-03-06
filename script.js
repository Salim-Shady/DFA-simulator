var canvas = document.getElementById('canvas');
var bg = document.getElementById('background');

//implements moving of the nodes on mouseup on the background
bg.addEventListener('mouseup', function(e) {
  var bgBounding = bg.getBoundingClientRect();

  //if control is pressed
  if (e.ctrlKey && sourceNode) {
    targetLoc = {
      x: e.clientX - bgBounding.x,
      y: e.clientY - bgBounding.y
    };
    moveNode(sourceNode, targetLoc.x, targetLoc.y);
    updateConnections(sourceNode);
    console.log("Node "+sourceNode.id+" was moved");
  }
  sourceNode = null;
});

var nodesHTML = [];
var nodesObjects = [];
var makeNode = document.getElementById('makeNode');

//creates initial node
createNode(false, 30, parseInt(canvas.getAttribute("height"))/2);

var sourceNode = null;
var targetNode = null;
var targetLoc = null;

var trBox = document.getElementById('Numtransition-box');
var trNum = parseInt(document.getElementById('Numtransition-text').innerHTML);



//add listeners for both nodes in the transition box to change value on click
/*
  L-click         => add 1
  SHIFT + L-click => add 5

  R-click         => subtract 1
  SHIFT + R-click => subtract 5
  */
for (var i = 0; i < trBox.childNodes.length; i++) {
  trBox.childNodes[i].addEventListener('click', function(e) {
    if (e.ctrlKey) {
      addTransition(5);
    } else {
      addTransition(1);
    }
  });

  trBox.childNodes[i].addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (e.ctrlKey) {
      subTransition(5);
    } else {
      subTransition(1);
    }
  });
}

//adds listener to the make node button
makeNode.addEventListener("click", function() {
  createNode(false);
});

//increase transition value
function addTransition(value) {
  let prevTrNum = trNum;
  trNum = trNum+value >= 10 ? 9 : trNum + value;
  console.log("TrNum "+prevTrNum+"-->"+trNum);
  trBox.childNodes[3].innerHTML = trNum;
}

//decrease transition value
function subTransition(value) {
  let prevTrNum = trNum;
  trNum = trNum-value < 0 ? 0 : trNum - value;
  console.log("TrNum "+prevTrNum+"-->"+trNum);
  trBox.childNodes[3].innerHTML = trNum;
}

//creates a new node
function createNode(accepting, nodeX, nodeY) {

  //creates and adds to nodes lists for objects
  var node =  new Node(accepting, nodesHTML.length);
  nodesObjects.push(node);

  var nodeVis = createNodeVis(node, nodeX, nodeY);

  nodeVis = addListeners(node,nodeVis);

  canvas.appendChild(nodeVis);

  //adds to nodes list for html elements
  nodesHTML.push(nodeVis);
  return node;
}//createNode


//adds the listeners to the node visuals
/*
  R-click on node        => removes transition viewed in transition box
  CTRL + R-click on node => change accepting state
  MouseDown              => select as source node
  MouseUp                => select as target node
*/
function addListeners(node, nodeVis) {
  //changes accepting states on right click
  nodeVis.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    console.log(e);
    if (e.ctrlKey) {
      node.accepting = !node.accepting;
      if (node.accepting) {
        nodeVis.childNodes[0].setAttribute("stroke", "rgba(0,255,0,0.5)");
      } else {
        nodeVis.childNodes[0].setAttribute("stroke", "rgba(0,0,0,0.3)");
      }
    } else if (e.altKey) {
      removeNode(e.target.parentNode);
    } else {
      removeCon(e.target.parentNode, trNum);
    }
  });

  //sets the sourceNode on mouse down
  nodeVis.addEventListener('mousedown', function(e) {
    // console.log(e.ctrlKey);
    e.preventDefault();
    if (e.button === 0) {
      sourceNode = e.target.parentNode;
    }
  });

  //creates connection on mouse up with target node
  nodeVis.addEventListener('mouseup', function(e) {
    // console.log(sourceNode);
    e.preventDefault();
    //if left click with no ctrl then create connection
    if (!e.ctrlKey && e.button === 0) {
      createCon(e);
    }
  });

  sourceNode = null;
  targetNode = null;
  return nodeVis;
}

//creates the graphics for the node and listerners for the node graphics
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
  circle.setAttribute("stroke-width", "3");
  circle.setAttribute("stroke", "rgba(0,0,0,0.3)");
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

  return graphic;
}

//moves a node by x,y
function moveNode(nodeH, x, y) {
  nodeH.childNodes[0].setAttribute("cx", x);
  nodeH.childNodes[0].setAttribute("cy", y);

  nodeH.childNodes[1].setAttribute("x", x-3);
  nodeH.childNodes[1].setAttribute("y", y+5);
}

//updates all the visuals for coonnections to node
function updateConnections(node) {
  //list of all the connections that end in node
  var toConns = document.querySelectorAll("g[id$='-"+node.id+"']");
  var fromConns = document.querySelectorAll("g[id^='tr"+node.id+"-']");

  //iterate through toConns and update positions of graphics with arrows to the node
  toConns.forEach(function(elem){
    let line = elem.childNodes[0];
    let text = elem.childNodes[1];

    line.setAttribute("x2", node.childNodes[0].getAttribute("cx"));
    line.setAttribute("y2", node.childNodes[0].getAttribute("cy"));

    let textPos = {
      x: ((parseInt(line.getAttribute("x1")) + parseInt(line.getAttribute("x2")))/2),
      y: ((parseInt(line.getAttribute("y1")) + parseInt(line.getAttribute("y2")))/2)
    };

    text.setAttribute("x", textPos.x);
    text.setAttribute("y", textPos.y);

  });

  //iterate through fromConns and update positions of graphics with arrows from the node
  fromConns.forEach(function(elem){
    let line = elem.childNodes[0];
    let text = elem.childNodes[1];

    line.setAttribute("x1", node.childNodes[0].getAttribute("cx"));
    line.setAttribute("y1", node.childNodes[0].getAttribute("cy"));

    let textPos = {
      x: ((parseInt(line.getAttribute("x1")) + parseInt(line.getAttribute("x2")))/2),
      y: ((parseInt(line.getAttribute("y1")) + parseInt(line.getAttribute("y2")))/2)
    };

    text.setAttribute("x", textPos.x);
    text.setAttribute("y", textPos.y);

  });
}

//creates connection between two nodes
function createCon(e) {
  //set the target node
  targetNode = e.target.parentNode;

  //check if both target and source nodes are non-empty
  if (sourceNode && targetNode) {
    //select the object version of both nodes
    var sourceNodeObj = nodesObjects[sourceNode.id];
    var targetNodeObj = nodesObjects[targetNode.id];

    //checks if the source already has an output with this transition
    if (!sourceNodeObj.outputs.hasOwnProperty(trNum)) {
      //add the target node as output to the source node
      sourceNodeObj.addOutput(targetNodeObj, trNum);
      createConVis(sourceNode, targetNode, trNum);
      console.log("|Source: Node-"+sourceNodeObj.id + "|\n|Transition: " + trNum, "|\n|Target: Node-"+targetNodeObj.id+"|");
    }
    // console.log(sourceNodeObj, targetNodeObj);
  }
}//createCon

function createConVis(source, target, transition) {
  //creates the elements for drawing line
  var line =  document.createElementNS("http://www.w3.org/2000/svg","line");
  var graphic = document.createElementNS("http://www.w3.org/2000/svg", "g");
  var text =  document.createElementNS("http://www.w3.org/2000/svg","text");

  //getting source and target co-ordinates
  var sourcePos = {
    x:parseInt(source.childNodes[0].getAttribute("cx")),
    y:parseInt(source.childNodes[0].getAttribute("cy"))
  };

  var targetPos = {
    x:parseInt(target.childNodes[0].getAttribute("cx")),
    y:parseInt(target.childNodes[0].getAttribute("cy"))
  };


  //setting the line graphics
  line.setAttribute("x1", sourcePos.x);
  line.setAttribute("y1", sourcePos.y);

  line.setAttribute("x2", targetPos.x);
  line.setAttribute("y2", targetPos.y);

  line.setAttribute("stroke", "black");
  line.setAttribute("marker-end", "url(#arrowhead)");

  //calculate text position
  var textPos = {
    x: ((parseInt(sourcePos.x) + parseInt(targetPos.x))/2),
    y: ((parseInt(sourcePos.y) + parseInt(targetPos.y))/2)
  }

  //text adjustment for edges
  // var anglePos = {
  //   x: targetPos.x - sourcePos.x,
  //   y: targetPos.y - sourcePos.y
  // }
  //
  // if (anglePos.x > 0) {
  //   textPos.y -= 15;
  // } else if (anglePos.x < 0) {
  //   textPos.y += 15;
  // } else {
  //   textPos.x -= 5;
  // }

  //check if a connection between source and target already exists
  if (document.getElementsByClassName(source.id+target.id).length === 0) {

    //set the visuls and pos of text
    text.setAttribute("x",textPos.x);
    text.setAttribute("y",textPos.y);
    text.innerHTML = transition;
    text.setAttribute("fill", "black")

    //add line and text to graphic
    graphic.appendChild(line);
    graphic.appendChild(text);

    //set the id of the connection graphic as "tr<source>-<transition>-<target>"
    graphic.setAttribute("id", "tr"+source.id+"-"+target.id);
    //set the class of the connection graphic as "<source><target>"
    graphic.setAttribute("class", source.id+target.id)

    canvas.appendChild(graphic);
  } else {
    //find the existing connection and update text field of that connection
    text = document.getElementsByClassName(source.id+target.id)[0].childNodes[1];
    text.innerHTML += ","+transition;
  }
}//createConVis

function removeCon(source, transition) {
  //get object version of html element
  transition = parseInt(transition);
  var sourceObj = htmlToObj(source);
  if (!sourceObj.outputs[transition]) {
    console.log("No "+transition+" transition");
    return;
  }

  //get target of the to be deteleted connection and then delete the object connection
  var target = objToHtml(sourceObj.outputs[transition]);
  delete sourceObj.outputs[transition];

  console.log("Remove tr: "+transition+"\nFrom:"+source.id+"\nTo:"+target.id);

  //delete the visual connection
  removeConVis(source, target, transition);
}//removeCon

function removeConVis(source, target, transition) {
  //get the line element
  var edge = document.getElementById('tr'+source.id+"-"+target.id);
  //check if edge is defined else return
  if (!edge) {
    console.log("Invalid parameters");
    return;
  }

  var edgeText = edge.childNodes[1].innerHTML;
  //check if only one transition between nodes
  if (edgeText.length === 1) {
    // remove the whole connection
    canvas.removeChild(edge);
  } else if (edgeText.includes(transition)){
    //search for the location of where the transition number appears in text
    var trLoc = edgeText.search(transition);

    //according to location appropriately remove the number
    if (trLoc === 0) {
      edge.childNodes[1].innerHTML = edgeText.slice(2);
    } else if (trLoc > 0) {
      var first = edgeText.slice(0, trLoc-1);
      var last = edgeText.slice(trLoc+1);
      edge.childNodes[1].innerHTML = first+last;
    }
  }
}//removeConVis

function objToHtml(obj) {
  return nodesHTML[obj.id];
}//objToHtml

function  htmlToObj(node) {
  return nodesObjects[parseInt(node.id)];
}//htmlToObj

function clearAll() {
  console.log("Clearing Nodes...");
  for (var i = nodesHTML.length-1; i > 0; i--) {
    canvas.removeChild(nodesHTML[i]);
    nodesHTML.pop();
    nodesObjects.pop();
  }

  console.log("Clearing Connections...");
  let connections = document.querySelectorAll("g[id^='tr']");
  connections.forEach(function(elem) {
    canvas.removeChild(elem);
  });

  nodesObjects[0].outputs = {};
}

function removeNode(nodeH) {
  let nodeObj = htmlToObj(nodeH);
  let nodeIndex = nodesObjects.indexOf(nodeObj);
  let toConns = document.querySelectorAll("g[id$='-"+nodeH.id+"']");
  let fromConns = document.querySelectorAll("g[id^='tr"+nodeH.id+"-']");

  if (nodeIndex === 0) {
    console.log("Cannot remove the initial node");
    return;
  } else if (toConns.length > 0 || fromConns.length > 0) {
    console.log("Cannot remove node with active connections");
    return;
  }

  updateConnections(nodeH);
  removeNodeVis(nodeH);

  nodesObjects[nodeIndex] = null;
  nodesHTML[nodeIndex] = null;

  console.log("Removing Node "+nodeIndex);
}

function removeNodeVis(nodeH) {
  nodeH.remove();
}


// function calcTextPos(A, B, dist) {
//   var H = {};
//
//   var n = B.y - A.y;
//   var c = (A.x-B.x)/n;
//   var k = (((B.x-A.x)*B.x)+((B.y-A.y)*B.y))/n;
//   k = k-B.y;
//
//   var quadX = {
//     a: 1+c*c,
//     b: 2*k*c-2*B.x,
//     c: B.x*B.x+k*k-dist*dist
//   };
//
//   H.x = quadSol(quadX);
//   H.y = {
//     pos: k+c*H.x.pos,
//     neg: k+c*H.x.neg
//   };
//
//   return H;
// }
//
// function quadSol(quad) {
//   var plus = (-quad.b+Math.sqrt(quad.b*quad.b-4*quad.a*quad.c))/(2*quad.a);
//   var minus = (-quad.b-Math.sqrt(quad.b*quad.b-4*quad.a*quad.c))/(2*quad.a);
//
//   return {pos: plus, neg: minus};
// }

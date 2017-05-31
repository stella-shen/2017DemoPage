// some related variables
var width = 1600;
var height = 350;
var img_width = 77;
var img_height = 80;
var radius = 10;
var maxNodeSize = 50;
var root;

//initialize
var svg = d3.select("#canvas-svg");
var force = d3.layout.force();

d3.json("../data/data.json", function(json) {

  root = json;
  
  root.fixed = true;
  root.x = width/2;
  root.y = height/4;

  update();
});

function update() {

  var nodes = flatten(root);
  var links = d3.layout.tree().links(nodes);

  //force layout initialize
  force.nodes(nodes).links(links)
       .gravity(0.05).charge(-1000)
       .linkDistance(50).friction(0.5)
       .linkStrength(function(l, i) { return 1; })
       .size([width, height])
       .on("tick", tick).start();

  //path related updates
  var path = svg.selectAll("path.link")
                .data(links, function(d) { return d.target.id; });
  path.enter().insert("svg:path")
      .attr("class", "link").style("stroke", "#3B170B");
  path.exit().remove();

  //node related updates
  var node = svg.selectAll("g.node").data(nodes, function(d) { return d.id; });
  var nodeEnter = node.enter().append("svg:g")
                      .attr("class", "node")
                      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";})
                      .on("click", click).call(force.drag);
  //append image into node
  /*var image_nodes = nodeEnter.append("svg:circle")
           .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
           .attr("fill", function(d, i) {
              var temp_radius = Math.sqrt(d.size) / 10 || 4.5;
              var defs = svg.append("svg:defs").attr("id", "imgdefs");
  
              var catpattern = defs.append("svg:pattern").attr("id", "catpattern"+i)
                                   .attr("height", 1).attr("width", 1);
              var images = catpattern.append("svg:image").attr("xlink:href",  d.img)
                                     .attr("width", img_width).attr("height", img_height)
                                     .attr("x", -(img_width/2-temp_radius)).attr("y", -(img_height/2-temp_radius));
              return "url(#catpattern" + i + ")";
           });*/

  var image_nodes = nodeEnter.append("svg:path")
                             .style("stroke", "black")
                             .style("fill", "white")
                             .attr("d", d3.svg.symbol()
                                          .size(200)
                                          .type(function(d) {
                                            console.log(d.shape);
                                            return d.shape;
                                          }))
  node.exit().remove();

  path = svg.selectAll("path.link");
  node = svg.selectAll("g.node");

  function tick() {
    path.attr("d", function(d) {
      return "M" + d.source.x + "," + d.source.y
            +"L" + d.target.x + "," + d.target.y;
    });
    node.attr("transform", function(d) {
      d.x = Math.max(maxNodeSize, Math.min(d.x, (width - radius)));
      d.y = Math.max(maxNodeSize, Math.min(d.y, (height - radius)));
      return "translate(" + d.x + "," + d.y + ")";
    });
  }
}

//return the list of all nodes under the root
function flatten(root) {
  var nodes = [];
  var i = 0;

  function recurse(node) {
    if (node.children) {
      node.children.forEach(recurse);
    }
    if(!node.id) {
      node.id = ++i;
    }
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}

//toggle children on click
function  click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }

  update();
}

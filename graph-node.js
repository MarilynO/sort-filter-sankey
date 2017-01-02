var GraphNode = function(name) {
  this.src = [];
  this.name = name;
  this.id = name;
  // this.column = 0;
  this.tar = [];
};

//adds a source to the array of sources of particular node
GraphNode.prototype.addSource = function (hit) {
  this.src.push(hit);
};

//returns array of all sources of particular node
GraphNode.prototype.getSource = function () {
  return this.src;
};

//adds a target to the array of targets of particular node
GraphNode.prototype.addTarget = function (hit) {
  this.tar.push(hit);
};

//returns array of all targets of particular node
GraphNode.prototype.getTarget = function () {
  return this.tar;
};

//checks whether array of objects contains a node of name 'name'
Array.prototype.contains = function (name) {
   for (i in this) {
       if (this[i]['name'] == name) return i;
   }
   return -1;
}

d3.csv('test-energy.csv', function(error, data) {
  console.log(data);
  var json = {
    nodes: [],
    links: []
  };
  var objKeys = Object.keys(data[0]);
  data.forEach(function(d) {
    var index = 0;
    for (var i in d) {
      //check if json.nodes contains the current node of noame d[objKeys[index]]
      //if yes, var node = json.nodes at that index, add respective srcs and tars
      var inOrOut = json.nodes.contains(d[objKeys[index]]);
      var node;
      if ( inOrOut != -1) {
        node = json.nodes[inOrOut];
        if (index != 0) {
          node.addSource(d[objKeys[index - 1]]);
        }
        if (index != objKeys.length - 1) {
          node.addTarget(d[objKeys[index + 1]]);
        }
        index++;
      } else {
        //if no, create a new node of name d[objkeys[index]] with respectice srcs and tars
        node = new GraphNode(d[objKeys[index]]);
        if (index != 0) {
          node.addSource(d[objKeys[index - 1]]);
        }
        if (index != objKeys.length - 1) {
          node.addTarget(d[objKeys[index + 1]]);
        }
        index++;
        json.nodes.push(node);
      }
    }
  });

  //
  json.nodes.forEach(function(d) {
    console.log(d);
    var linky = {
      source: d.name,
      target: json.nodes.contains(d.tar[0]),
      value: 1
    };
    for (var i = 1; i < d.tar.length; i++) {
      if (d.tar[i] == linky.target) {
        linky.value++;
      } else {
        json.links.push(linky);
        linky.target = json.nodes.contains(d.tar[0]);
        linky.value = 1;
      }
    }
  });
  console.log(json);
});

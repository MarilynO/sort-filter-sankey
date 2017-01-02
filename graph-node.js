var GraphNode = function(name) {
  this.src = [];
  this.name = name;
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

//returns -1 if src array doesn't contain val parameter, 1 otherwise
GraphNode.prototype.srcContains = function (val) {
  for (var i; i < this.src.length; i++) {
    if (this.src[i] == val) {
      return 1;
    }
  }
  return -1;
};

//returns -1 if tar array doesn't contain val parameter, 1 otherwise
GraphNode.prototype.tarContains = function (val) {
  for (var i; i < this.tar.length; i++) {
    if (this.tar[i] == val) {
      return 1;
    }
  }
  return -1;
};

d3.csv('test-energy.csv', function(error, data) {
  console.log(data);
  var nodes = [];
  var objKeys = Object.keys(data[0]);
  console.log(objKeys.length);
  data.forEach(function(d) {
    for (var i in d) {

    }
  })
});

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

function formatData(data) {
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

  json.nodes.forEach(function(d) {
    if (d.tar.length > 0) {
      var linky = {source: parseInt(json.nodes.contains(d.name)), target: parseInt(json.nodes.contains(d.tar[0])), value: 0};
      for (var i = 0; i < d.tar.length + 1; i++) {
        var temp = {
          source: parseInt(json.nodes.contains(d.name)),
          target: parseInt(json.nodes.contains(d.tar[i])),
          value: 1
        };
        if (temp.target == linky.target) {
          linky.value++;
        } else {
          json.links.push(linky);
          linky = temp;
        }
      }
    }
  });
  return json;
}

//load different CSV's here
d3.csv('test-energy.csv', function(error, data) {
  console.log(data);

  //populate select column feature
  for (var i in data[0]) {
    $('#columnSelect').append($('<option></option>')
        .attr('value', i)
        .attr('selected', true)
        .text(i));
  }

  var all = Object.keys(data[0]);
  var json = columnFilter(all);
  console.log(json);

  var colors = {
        'bioenergy':         '#edbd00',
        'solar':              '#367d85',
        'hydro':             '#97ba4c',
        'wind':              '#f5662b',
        'environment': '#3f3e47',
        'engineering':            '#9f9fa3'
      };

  var chart = d3.select("#chart").append("svg").chart("Sankey.Path");
  chart
    .name(label)
    .colorNodes(function(name, node) {
      return color(node, 1) || colors.fallback;
    })
    .colorLinks(function(link) {
      return color(link.source, 4) || color(link.target, 1) || colors.fallback;
    })
    .nodeWidth(15)
    .nodePadding(10)
    .spread(true)
    .iterations(0)
    .draw(json);
  function label(node) {
    return node.name.replace(/\s*\(.*?\)$/, '');
  }
  function color(node, depth) {
    var id = node.id.replace(/(_score)?(_\d+)?$/, '');
    if (colors[id]) {
      return colors[id];
    } else if (depth > 0 && node.targetLinks && node.targetLinks.length == 1) {
      return color(node.targetLinks[0].source, depth-1);
    } else {
      return null;
    }
  }

  //copy 'data' and filter each object to remove the key:value that corresponds to the column
  function columnFilter(valArr) {
    var filtered = [];
    data.forEach(function(d) {
      var obj = Object.assign({}, d);
      filtered.push(obj);
    });
    filtered.forEach(function(d) {
      for (var i in d) {
        if (valArr.indexOf(i) == -1) {
          delete(d[i]);
        }
      }
    });
    var newData = formatData(filtered);
    return newData;
  }

  //redraw chart if different columns selected
  $('#columnSelect').change(function() {
    selectedColumns = [];

    $('#columnSelect option:selected').each(function() {
      selectedColumns.push($(this).text());
    });
    json = columnFilter(selectedColumns);
    chart.draw(json);
  });
});

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
d3.csv('UWSustainabilityResearchers_3_20.csv', function(error, data) {
  //keep track of columns filtered in an array
  var selColumns = [];
  //keep track of rows filtered in an array
  var selRows = [];
  // var node;
  var outside = [];
  var colors = {};
  var selectedRows = [];
  var emptyData = {"nodes": [], "links": []};

  //array of possible colors to use for links
  var possColor = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'];

  //iterate through all 'specialty' nodes and assign color;
  data.forEach(function(d) {
    for (var i in d) {
      if (i == 'specialty') {
        if (!(d[i] in colors)) {
          colors[d[i]] = possColor[0];
          possColor = possColor.slice(1, possColor.length);
        }
      }
    }
  });

  //populate select column feature
  for (var i in data[0]) {
    var col = $('#columnSelect');
    var lab = $('<label></label>');
    var check = $('<input type="checkbox" checked>');
    check.attr('value', i);
    lab.append(check);
    lab.append(i);
    col.append(lab);
    col.append($('</br>'));
  }

  var all = Object.keys(data[0]);
  var json = allFilter();

  //populate select row feature
  json.nodes.forEach(function(d) {
    $('#nodeSelect').append($('<option></option>')
        .attr('value', d.name)
        .text(d.name));
  });



  var chart = d3.select("#chart").append("svg").attr('class', 'chart-area').chart("Sankey.Path");

  chart.name(label)
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
    addHeaders();

    function addHeaders() {
      // crucialVals = chart.getX();
      // $(".column-headers").remove();
      var xs = chart.getX();
      var heads = Object.keys(data[0]);
      var headData = {};
      heads.forEach(function(d, i) {
        headData.word = d;
        headData.location = xs[i];
      })
      var space = d3.select(".chart-area");
      var headers = space.selectAll(".column-headers").data(xs);


      headers.enter().append('text')
        .attr('dy', 25)
        .attr('dx', function(d,i) {
          return d;
        })
        .attr('class', 'column-headers')
        .text(function(d,i) {
          return outside[i];
        });

        headers.exit().remove();

        headers.transition().duration(1000)
          // .attr('dy', 25)
          .attr('dx', function(d,i) {
            return d;
          })
          .text(function(d,i) {
            return heads[i];
          });
    }

  rectListen();
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

  //filter all data using above information
  function allFilter() {
    //filtered data
    var filtered = [];

    //iterate through all data and copy into filtered (data)
    data.forEach(function(d) {
      var obj = Object.assign({}, d);
      filtered.push(obj);
    });

    //iterate through each datum in filtered and delete key: value pairs from
    //the data where each key value pair represents a column
    if (selColumns.length > 0) {
      filtered.forEach(function(d) {
        for (var i in d) {
          if (selColumns.indexOf(i) == -1) {
            delete(d[i]);
          }
        }
      })
    }

    //iterate through data and delete nodes that aren't connected to nodes
    //in selRows
    if (selRows.length > 0){
      var len = filtered.length;
      for (var i = 0; i < len; i++) {
        var containsNode = false;
        for (var j in filtered[i]) {
          if (selRows.indexOf(filtered[i][j]) != -1) {
            containsNode = true;
          }
        }
        if (!containsNode) {
          filtered.splice(i, 1);
          len--;
          i--;
        }
      }
    }

    //return new formatted data
    var newData = formatData(filtered);
    return newData;
  }

  //redraw chart if different columns selected

  $('#columnSelect').change(function() {
    selColumns = [];

    $('#columnSelect input:checked').each(function() {
      selColumns.push($(this).val());
    });
    if ($('#columnSelect input:checked').length <= 2) {
      $('#columnSelect input:checked').each(function(d) {
        $('#columnSelect input:checked')[d].disabled = true;
      })
    } else {
      $('#columnSelect input:checked').each(function(d) {
        $('#columnSelect input:checked')[d].disabled = false;
      })
    }
    json = allFilter();
    chart.draw(emptyData);
    chart.draw(json);
    addHeaders();
    rectListen();
  });

  function redraw(json) {
    chart.draw(emptyData);
    setTimeout(chart.draw(json), 1000);
    addHeaders();
    rectListen();
  }

  //current problem is that rects are getting listeners when chart is redrawn
  //but in this method draw is called again so its drawn without calling rectListen
  //which re adds listeners to the nodes. bad recursive cycle

  function rectListen() {
    $('.node').each(function() {
      var myNode = $(this);
      var text = myNode[0]['lastChild']['textContent'];
      var rect = myNode[0]['firstChild'];
      rect.onclick = function() {
        addListeners(myNode);
      };
    });
  }

  function addListeners(node) {
    var text = node[0]['lastChild']['textContent'];
    console.log(text);
    var rect = node[0]['firstChild'];
    selRows.push(text);
    json = allFilter();
    // chart.draw(emptyData);
    // chart.draw(json);
    redraw(json);
    crucialVals = chart.getX();
    addHeaders();
    var textDiv = $('#sel-nodes');
    var p = $('<p></p>').text(text);
    p.click(function() {
      var ind = selRows.indexOf($(this)[0]['innerText']);
      selRows.splice(ind, 1);
      if (selRows.length == 0) {
        json = allFilter();
      } else {
        json = allFilter();
      }
      // chart.draw(emptyData);
      // chart.draw(json);
      redraw(json);
      crucialVals = chart.getX();
      addHeaders();
      $(this).remove();
    });
    textDiv.append(p);
  }

  //redraw chart if different nodes selected
  $('#nodeSelect').change(function() {
    selRows = [];

    $('#nodeSelect option:selected').each(function() {
      selRows.push($(this).text());
    });
    json = allFilter();
    chart.draw(emptyData);
    chart.draw(json);
    rectListen();
    addHeaders();
  });
});

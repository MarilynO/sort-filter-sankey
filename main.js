// var colors = {
//       'environment':         '#edbd00',
//       'social':              '#367d85',
//       'animals':             '#97ba4c',
//       'health':              '#f5662b',
//       'research_ingredient': '#3f3e47',
//       'fallback':            '#9f9fa3'
//     };
// d3.json("custom-data.json", function(error, json) {
//   console.log(json);
//   var chart = d3.select("#chart").append("svg").chart("Sankey.Path");
//   chart
//     .name(label)
//     .colorNodes(function(name, node) {
//       return color(node, 1) || colors.fallback;
//     })
//     .colorLinks(function(link) {
//       return color(link.source, 4) || color(link.target, 1) || colors.fallback;
//     })
//     .nodeWidth(15)
//     .nodePadding(10)
//     .spread(true)
//     .iterations(0)
//     .draw(json);
//   function label(node) {
//     return node.name.replace(/\s*\(.*?\)$/, '');
//   }
//   function color(node, depth) {
//     var id = node.id.replace(/(_score)?(_\d+)?$/, '');
//     if (colors[id]) {
//       return colors[id];
//     } else if (depth > 0 && node.targetLinks && node.targetLinks.length == 1) {
//       return color(node.targetLinks[0].source, depth-1);
//     } else {
//       return null;
//     }
//   }
//
//   var button = document.getElementById('button');
//
//   var filterData = function() {
//     console.log('wingert');
//   }
//
//   button.addEventListener('click', filterData);
// });
d3.csv('test-energy.csv', function(error, tabular) {
  console.log(tabular);

  function contains(arr, val) {
    console.log(arr);
    for (i in arr) {
      if(arr[i]['name'] == val) {
        return 1;
      }
    }
    return -1;
  }

  function formatData(x) {
    var json = {
      nodes: [],
      links: []
    };
    var hierarchy = Object.keys(x[0]);
    console.log(hierarchy);
    var index = 0;
    for (var i = 0; i < hierarchy.length; i++) {
      x.forEach(function(d) {
        //all the names are in tree order
        console.log(d[hierarchy[i]]);
        if (contains(json.nodes, d[hierarchy[i]]) == -1) {
          json.nodes.push(
            {
              "name": d[hierarchy[i]],
              "id": d[hierarchy[i]],
              "column": i
            }
          );
          json.links.push(
            {
              "column": i,
              "source": (index - 1),
              "target": (index + 1),
              "value": 1
            }
          );
        } else {
          console.log('shoes');
        }
      })
    }
    return json;
  }

  var data = formatData(tabular);
  console.log(data);
});

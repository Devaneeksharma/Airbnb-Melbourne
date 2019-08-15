function makeLineChart(param1,param2,param3) {
    //removeing all the svg line element
    d3.selectAll("#svgline svg").remove(); 
    // setting up the margin,to,height,weight
    var margin = {top: 40, right: 20, bottom: 30, left: 50},
    width = 1500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    //adding the svg element to svgline
    var svg = d3.select("#svgline").append("svg")
    .style("overflow-x","scroll")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
    //adding g element for svg
    var g = svg.append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    g.append('text')
    .attr('x', (width / 2))             
      .attr('y', 0 - (margin.top / 3))
    .attr('text-anchor', 'middle')  
      .style('font-size', '20px')
      .style('align','center')
        
    var x = d3.scale.ordinal()
    .rangeRoundBands([9, width]);

    var y = d3.scaleLinear().range([height, 0]);
    // Set the color scale
    var color = d3.scale.category10();
    
    var line = d3.svg.line()
    .x(function(d) {
      return x(d.name);
    })
    .y(function(d) {
      return y(d.price);
    });
    
    var xlabels=[];

    //data for price
    d3.json("price.json", function(error, data) {
        
        data.map(function(d){
                if(d.name=== param1||d.name===param2||d.name===param3){
                  xlabels.push(d.name);
                    
                };
                 });
        //filtering the data based on the selected parameters by users
       var dat =data.filter(function(d){ return d.name === param1|| d.name===param2||d.name==param3});
        
      color.domain(d3.keys(dat[0]).filter(function(key) {
          return key !== "name" && key !== "_id";
      }));
       
        // getting the prices data which includes name and price.
      var prices = color.domain().map(function(name) {
        return {
          name: name,
          values: dat.map(function(d) {
            return {
              name: d.name,
              price: +d[name]
            };
          })
        };
      });
        // labes for the x axis
        x.domain(xlabels);
        //labels for y axis
        y.domain([
    d3.min(prices, function(c) {
      return d3.min(c.values, function(v) {
        return v.price;
      });
    }),
    d3.max(prices, function(c) {
      return d3.max(c.values, function(v) {
        return v.price;
      });
    })
  ]);
// Add the X Axis
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // Add the Y Axis
  g.append("g")
      .call(d3.axisLeft(y))
        .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Price (AUD)");
      // Drawing the lines
      var line1 = g.selectAll(".price")
        .data(prices)
        .enter().append("g")
        .attr("class", "price");

      line1.append("path")
        .attr("class", "line")
        .attr("fill","none")
        .attr("d", function(d) {
          return line(d.values);
        })
        .style("stroke", function(d) {
          return color(d.name);
        })
        .style("stroke-width", "7px");
      // Add the circles
      line1.append("g").selectAll("circle")
        .data(function(d){return d.values})
        .enter()
        .append("circle")
        .attr("r", 2)
        .attr("cx", function(dd){return x(dd.name)})
        .attr("cy", function(dd){return y(dd.price)})
        .attr("fill", "none")
        .attr("stroke", function(d){return color(this.parentNode.__data__.name)});
      // Add label to the end of the line
      line1.append("text")
        .attr("class", "label")
        .datum(function (d) {
          return {
            name: d.name,
            values: d.values[d.values.length - 1]
          };
        })
        .attr("transform", function (d) {
          return "translate(" + x(d.values.name) + "," + y(d.values.price) + ")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function (d) {
          return d.name;
      });

    // Add the mouse line
    var mouseG = g.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path")
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(prices)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", function (d) {
        return color(d.name);
      })
      .style("fill", "none")
      .style("stroke-width", "2px")
      .style("opacity", "0");

    mousePerLine.append("text")
        .attr("class", "hover-text")
        .attr("dy", "-1em")
        .attr("transform", "translate(10,3)");

    // appending rect to cpture mouse
    mouseG.append('svg:rect') 
      .attr('width', width) 
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function () { 
        // hide line, circles and text on on mouse out 
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
        //mouse hover action 
      .on('mouseover', function () { 
        // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function () { 
        // mouse moving over canvas
        var mouse = d3.mouse(this);

        //tranforming the mouse action per line.
        d3.selectAll(".mouse-per-line")
          .attr("transform", function (d, i) {
            
            var leftEdges = x.range();
            var width = x.rangeBand();
            var j;
            for(j=0; mouse[0] > (leftEdges[j] + width); j++) {}
            //getting the x names from x and then bisects to get the X,xo,y, cordinates of the object.
            var xName = x.domain()[j];
            var bisect = d3.bisector(function (d) { return d.name; }).left;
            var idx = bisect(d.values, xName);
            if (xName == 'Yarra Ranges') {
                idx = leftEdges.length-1            
            }
            //get the price and show it as the text
            d3.select(this).select('text')
              .text(y.invert(y(d.values[idx].price)).toFixed(0)+"$");
            // showing price on the mouse line
            d3.select(".mouse-line")
              .attr("d", function () {
                var data = "M" + x(d.values[idx].name) + "," + height;
                data += " " + x(d.values[idx].name) + "," + 0;
                return data;
              });
            return "translate(" + x(d.values[idx].name) + "," + y(d.values[idx].price) + ")";
          });
      });


    });

};

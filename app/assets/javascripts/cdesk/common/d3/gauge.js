(function() {
  "use strict";
  commonModule.service("gauge", function(_,constants) {
    var gauges = [];
    var dashContainer;
    var readings = [];
    var configs = [];

    var greenColor = "#00ff00";
    var lightColor = "#EEEEEE";
    var strokeColor = "#ff0000";
    function updateGauge(key, value) {
      readings[key] = value;
      gauges[key].redraw(key);
    };
    function setMessage(key, msg) {
      configs[key].msg = msg;
    };
    function getMessage(key) {
      var value = Math.round(readings[key]);
      return value.toString() + configs[key].msg
    };
    this.setMessage = setMessage;
    this.updateGauge = updateGauge;
    this.drawPointer = function(key) {
      gauges[key].drawPointer(getReadingValue(key, gauges[key].config.max));
    }
    this.getReadingValue = getReadingValue;
    function getReadingValue (name, max) {
      return readings[name] * max / 100;
    };
    this.createGauge = function() {

      createDashboard();
      function createDashboard() {
        createDash();
        createGauge(dashContainer, constants.GAUGE_PERFORMANCE, "", 120, 250,200);
      };


      function createDash()
      {
        var body = d3.select("#dashboardContainer")
          .append("svg:svg")
          .attr("class", "dash")
          .attr("width", 500)
          .attr("height", 350);
        var dasharea = body.selectAll("ellipse");
        dashContainer =  body.append("svg:g").attr("class", "dashContainer")
          .attr("width",500)
          .attr("height",350);
      };

      function createGauge(myContainer, name, label, sizebias, containerOffsetx, containerOffsety) {
        var minSize = 120;
        var config = {
          size: minSize + sizebias,
          innerRadius: (minSize + sizebias)/2,
          outerRadius: (minSize + sizebias)*0.55,
          cx: containerOffsetx,
          cy: containerOffsety,
          label: label,
          min: 0,
          max: 180,
          ticks: 24
        };

        gauges[name] = new Gauge(myContainer, name, config);
        readings[name] = 0;
        gauges[name].render();
      }

      function Gauge(myContainer, name, configuration) {
        this.name = name;
        this.myContainer = myContainer;

        var self = this;

        this.configure = function (configuration) {
          this.config = configuration;

          this.config.size = this.config.size;

          this.config.radius = this.config.size / 2;
          this.config.cx = this.config.cx;
          this.config.cy = this.config.cy;

          this.config.min = configuration.min || 0;
          this.config.max = configuration.max || 100;
          this.config.range = this.config.max - this.config.min;
          this.config.ticks = configuration.ticks || 23
          this.config.greenColor = configuration.greenColor || greenColor;
          this.config.faceColor = configuration.faceColor || lightColor;
          configs[name] = this.config;
        };

        this.createRadialLine = function(container, value, color) {
          var line = d3.svg.line.radial()
            .angle(function(d) { return d.angle; })
            .radius(function(d) { return d.radius; });
          container.append("svg:path")
            .attr("transform", "translate(" + this.config.cx + "," + this.config.cy + ")")
            .attr("d", line([{angle:value, radius:this.config.innerRadius},{angle:value, radius:this.config.outerRadius}]))
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("class", "line");
        }

        this.render = function () {
          this.myContainer.selectAll("svg").remove();
          this.myContainer.selectAll("path").remove();
          this.body = this.myContainer
            .append("svg:svg")
            .attr("class", "gauge")
            .attr("x", this.myContainer.x)
            .attr("y", this.myContainer.y)
            .attr("width", this.myContainer.width)
            .attr("height", this.myContainer.height)

          var anglesFill = [], anglesEmpty = [];
          var readingValue = getReadingValue(name, this.config.max);
          var ticksFill = Math.round(this.config.ticks * readingValue / this.config.max) + 1;
          var tickAngle = this.valueToRadians(this.config.range/this.config.ticks);
          if(ticksFill > 0) {
            anglesFill[0] = -Math.PI / 2;
            for (var i = 1; i < ticksFill; i++) {
              anglesFill.push(anglesFill[i - 1] + tickAngle);
            }
          }
          var prev = (ticksFill > 0) ? ticksFill : 1;
          if(ticksFill < this.config.ticks) {
            anglesEmpty[0] = anglesFill[prev - 1] + tickAngle;
            for (var j = 1; j < this.config.ticks - ticksFill + 1; j++) {
              anglesEmpty.push(anglesEmpty[j - 1] + tickAngle);
            }
          }
          var self = this;
          _.each(anglesFill, function(value) {
            self.createRadialLine(self.myContainer, value, "#66CD00");
          });

          _.each(anglesEmpty, function(value) {
            self.createRadialLine(self.myContainer, value, strokeColor);
          });

          this.body.append("svg:path")
            .style("fill", greenColor)
            .attr("d", d3.svg.arc()
            .startAngle(this.valueToRadians(0))
            .endAngle(this.valueToRadians(readingValue))
            .innerRadius(this.config.innerRadius)
            .outerRadius(this.config.outerRadius))
            .style("opacity", 0.8)
            .attr("transform", function () {
              return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)";
            });
          var line = d3.svg.line()
            .x(function (d) {
              return d.x;
            })
            .y(function (d) {
              return d.y;
            })
            .interpolate("basis");
          this.myContainer.selectAll("path").transition()
//            .attr("d", line)
            .ease("linear")
            .duration(100);
          var faceContainer = this.body.append("svg:g").attr("class", "faceContainer");
          var bandsContainer = this.body.append("svg:g").attr("class", "bandsContainer");
          var ticksContainer = this.body.append("svg:g").attr("class", "ticksContainer");

          var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer");
          this.drawPointer(0);
          pointerContainer.append("svg:circle")
            .attr("cx", this.config.cx)
            .attr("cy", this.config.cy)
            .attr("r", 0.06 * this.config.radius)
            .style("fill", "#4684EE")
            .style("stroke", "#666")
            .style("opacity", 1);
        };

        this.redraw = function (name) {
          this.render();
          this.drawPointer(getReadingValue(name,this.config.max));
        };

        this.drawPointer = function (value) {
          var delta = this.config.range / 13;

          var head = this.valueToPoint(value, 0.95);
          var head1 = this.valueToPoint(value - delta, 0.07);
          var head2 = this.valueToPoint(value + delta, 0.07);

          var data = [head1, head, head2];
          var line = d3.svg.line()
            .x(function (d) {
              return d.x;
            })
            .y(function (d) {
              return d.y;
            })
            .interpolate("basis");

          var pointerContainer = this.body.select(".pointerContainer");

          var pointer = pointerContainer.selectAll("path").data([data]);

          pointer.enter()
            .append("svg:path")
            .attr("d", line)
            .style("fill", "#000099")
            .style("stroke", "#000077")
            .style("fill-opacity", 0.7);

          pointer.transition()
            .attr("d", line)
            .ease("linear")
            .duration(100);

          var fontSize = Math.round(this.config.size / 10);
          pointerContainer.selectAll("text")
            .data([value])
            .text(getMessage(name))
            .enter()
            .append("svg:text")
            .attr("x", this.config.cx)
            .attr("y",  this.config.cy + this.config.size/6 + fontSize)
            .attr("dy", fontSize / 2)
            .attr("text-anchor", "middle")
            .text(getMessage(name))
            .style("font-size", fontSize + "px")
            .style("fill", "#000")
            .style("stroke-width", "0px");
        };

        this.valueToRadians = function (value) {
          return value * Math.PI / 180;
        };

        this.valueToPoint = function (value, factor) {
          var len = this.config.radius * factor;
          var inRadians = this.valueToRadians(value);
          var point = {
            x: this.config.cx - len * Math.cos(inRadians),
            y: this.config.cy - len * Math.sin(inRadians)
          };

          return point;
        };

        this.configure(configuration);
      }
    };
  })
}());

(function() {
  "use strict";
  commonModule.directive("gauge", function () {
    return {
      restrict: 'EAC',
      templateUrl: 'gauge'
    }
  })
}());
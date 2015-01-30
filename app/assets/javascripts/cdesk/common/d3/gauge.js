(function() {
  "use strict";
  commonModule.service("gauge", function(_,constants, $window) {
    var gauges = [];
    var dashContainer;
    var readings = [];
    var configs = [];

    var greenColor = "#3BD400";
    var lightColor = "#EEEEEE";
    var orangeColor = "#F5B200";
    var lightBlue = "#CFE2F0";
    function updateGauge(key, value) {
      readings[key] = value;
      gauges[key].redraw(key);
    };
    function setMessage(key, msg) {
      configs[key].msg = msg;
    };
    function getMessage(key) {
      var value = Math.round(readings[key]);
      var msg = (configs[key].msg === undefined) ? '' : configs[key].msg;
      return value.toString() + msg;
    };
    this.setMessage = setMessage;
    this.updateGauge = updateGauge;

    function getReadingValue (name, max) {
      return readings[name] * max / 100;
    };

    var currentGauge = this;
    this.setLeftArcClickHandler = function(value) {
      currentGauge.leftArcClickHandler = value;
    }

    this.setRightArcClickHandler = function(value) {
      currentGauge.rightArcClickHandler = value;
    }

    this.createGauge = function() {

      createDashboard();
      function createDashboard() {
        createDash();
        createGauge(dashContainer, constants.GAUGE_PERFORMANCE, "", 40, 175,125);
      };

      function createDash()
      {
        var body = d3.select("#dashboardContainer")
          .append("svg:svg")
          .attr("class", "dash")
          .attr("width", 500)
          .attr("height", 280);
        dashContainer =  body.append("svg:g").attr("class", "dashContainer")
          .attr("width",500)
          .attr("height",300);
      };

      function createGauge(myContainer, name, label, sizebias, containerOffsetx, containerOffsety) {
        var minSize = 120;
        var config = {
          size: minSize + sizebias,
          innerRadius: (minSize + sizebias)/3.5,
          outerRadius: (minSize + sizebias)*0.55,
          outerRingR1: (minSize + sizebias)*0.65,
          outerRingR2: (minSize + sizebias)*0.70,
          animeDuration: 500,
          cx: containerOffsetx,
          cy: containerOffsety,
          label: label,
          min: 0,
          max: 280,
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
        this.configure(configuration);
        this.valueToRadians = function (value) {
          return value * Math.PI / 180;
        };
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

          this.leftArc = createArc(currentGauge.leftArcClickHandler, this.body, self.config.cx, self.config.cy, -this.config.max/2, 0, greenColor);
          this.rightArc = createArc(currentGauge.rightArcClickHandler, this.body, self.config.cx, self.config.cy, this.config.max/2, -this.config.max + this.config.min + 5, orangeColor);
          this.outerArc = createArc(undefined, this.body, self.config.cx, self.config.cy, -this.config.max/2, this.config.max, lightBlue, 1, outerArcFunc);

          var leftDotPt = {x: self.config.cx - this.config.outerRingR2 - 10, y:self.config.cy + this.config.outerRingR2};
          var rightDotPt = {x: self.config.cx + this.config.outerRingR2 - 120, y: leftDotPt.y};
          this.leftDot = createCircle(this.body, leftDotPt.x, leftDotPt.y, greenColor, 5);
          this.rightDot = createCircle(this.body, rightDotPt.x, rightDotPt.y, orangeColor, 5);
//          this.rightDot =
          this.svgText = createText(this.myContainer, this.config.cx-23, this.config.cy, "0", "sans-serif", 30, "bold", "black");
          this.rightDotText = createText(this.myContainer, rightDotPt.x + 10, rightDotPt.y + 5, "0", "sans-serif", 14, "", "black");
          this.leftDotText = createText(this.myContainer, leftDotPt.x + 10, leftDotPt.y + 5, "0", "sans-serif", 14, "", "black");

          this.pctX = this.config.cx + 12;
          this.pctTxt = this.myContainer.append("text")
            .attr("x", this.pctX)
            .attr("y", this.config.cy-6)
            .text('%')
            .attr("font-family", "sans-serif")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "black");

          var faceContainer = this.body.append("svg:g").attr("class", "faceContainer");
          var bandsContainer = this.body.append("svg:g").attr("class", "bandsContainer");
          var ticksContainer = this.body.append("svg:g").attr("class", "ticksContainer");

        };
        var arc = d3.svg.arc()
          .startAngle(this.valueToRadians(this.config.min))
          .innerRadius(this.config.innerRadius)
          .outerRadius(this.config.outerRadius);
        var outerArcFunc = d3.svg.arc()
          .startAngle(this.valueToRadians(this.config.min))
          .innerRadius(this.config.outerRingR1)
          .outerRadius(this.config.outerRingR2);

        //Explained example available at http://bl.ocks.org/mbostock/5100636
        function arcTween(transition, newAngle) {
          transition.attrTween("d", function(d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function(t) {
              d.endAngle = interpolate(t);
              return arc(d);
            };
          });
        }
        function createText(container, x, y, text, fontFamily, fontSize, fontWeight, fill) {
          return container.append("text")
            .attr("x", x)
            .attr("y", y)
            .text('0')
            .attr("font-family", fontFamily)
            .attr("font-size", fontSize + "px")
            .attr("font-weight", fontWeight)
            .attr("fill", fill);
        }
        function createCircle(container, x, y, color, radius) {
          container.append("circle")
            .attr("r", radius)
            .attr("fill", color)
            .attr("transform", function() {
              return "translate(" + x + ", " + y +")"
            });
        }
        function createArc(clickHandler, container, x, y, initialAngle, endAngle, color, opacity, arcFunc) {
          if(opacity === undefined) opacity = 1;
          if(arcFunc === undefined) arcFunc = arc;
          if(clickHandler === undefined) clickHandler = function() {};
          return container.append("svg:path")
            .style("fill", color)
            .datum({endAngle: self.valueToRadians(endAngle)})
            .attr("d", arcFunc)
            .style("opacity", opacity)
            .attr("transform", function () {
              return "translate(" + x + ", " + y + ") rotate(" + initialAngle + ")";
            })
            .on('click', clickHandler)
            .style("cursor", "pointer");
        }

        this.animateArcs = function() {
          var readingValue = getReadingValue(name, this.config.max);
          if(readingValue === 0) readingValue = 1;
          this.leftArc.transition()
            .duration(this.config.animeDuration)
            .call(arcTween, this.valueToRadians(readingValue));
          animateRightArc();
        };
        function animateRightArc() {
          var readingValue = -280 + getReadingValue(name, self.config.max) + 1;
          self.rightArc.transition()
            .duration(self.config.animeDuration)
            .call(arcTween, self.valueToRadians(readingValue))
        }
        this.animateText = function() {
          var self = this;
          this.svgText
            .transition()
            .duration(this.config.animeDuration)
            .tween("text", function() {
              return function(t) {
                var i = d3.interpolate(this.textContent, readings[name]);
                this.textContent = Math.round(i(t));
                if(this.textContent === '100') {
                  self.pctTxt.attr("x", self.pctX + 15)
                } else {
                  self.pctTxt.attr("x", self.pctX);
                }
//                self.pctTxt.attr("x", this.x.baseVal["0"].value + 33);
              };
            });
        };

        this.redraw = function () {
          this.animateArcs();
          this.animateText();
          //hardcoding widget message right now, later move it to config to generalize for gauge
          this.leftDotText.text(readings[name].toString() + '% on track');
          this.rightDotText.text((100 - readings[name]).toString() + '% underperforming');
        };

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
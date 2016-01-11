(function() {
  "use strict";
  commonModule.service("gauge", function(_,constants, $window) {
    var gauges = [];
    var dashContainer;
    var readings = [];
    var configs = [];

    var greenColor = "#3BD400";
    var lightColor = "#EEEEEE";
    var orangeColor = "#F1661F";
    var lightBlue = "#D4DFE6";
    var greyColor = "#C0C7D0" ;

    function updateGauge(key, value) {
        var result = {
            onTrackPct : value.onTrackPct,
            onTrack : value.onTrack,
            underPerforming : value.underPerforming ,
            others : value.others,
            totalCampaigns : value.totalCampaigns
        };

      readings[key] = result;
      gauges[key].redraw(key);
    };
    function setMessage(key, msg) {
      configs[key].msg = msg;
    };

    this.setMessage = setMessage;
    this.updateGauge = updateGauge;

    function getReadingValue (name, max) {
      return ( readings[name].onTrackPct !== undefined) ? readings[name].onTrackPct * max / 100 : 0 ;
    };

    var currentGauge = this;

    this.setLeftArcClickHandler = function(value) {
      currentGauge.leftArcClickHandler = value;
    };

    this.setRightArcClickHandler = function(value) {
      currentGauge.rightArcClickHandler = value;
    };

//     this.setGreyArcClickHandler = function(value) {
//          currentGauge.greyArcClickHandler = value;
//      }

    this.createGauge = function() {

      createDashboard();

      function createDashboard() {
        createDash();
        createGauge(dashContainer, constants.GAUGE_PERFORMANCE, "", 40, 165,112);
      };


      function createDash()
      {
        var body = d3.select("#dashboardContainer") //chartContainer
            .attr("id", "dashboardContainer")
          .append("svg:svg")
          .attr("class", "dash")
          .attr("width", 350)
          .attr("height", 280);
        dashContainer =  body.append("svg:g").attr("class", "dashContainer")
            .attr("id","dashContainer")
          .attr("width",500)
          .attr("height",300);
      };

      function createGauge(myContainer, name, label, sizebias, containerOffsetx, containerOffsety) {
        var minSize = 120;

        var getGradient = function(container,id, lightColor,offsetLight, darkColor, offsetDartk){
              var id = container.append("svg:defs")
                  .append("svg:linearGradient")
                  .attr("id", id)
                  .attr("x1", "0%")
                  .attr("y1", "0%")
                  .attr("x2", "0%")
                  .attr("y2", "100%")
                  .attr("spreadMethod", "pad");

              id.append("svg:stop")
                  .attr("offset", offsetLight)
                  .attr("stop-color", lightColor)
                  .attr("stop-opacity", 1);

              id.append("svg:stop")
                  .attr("offset", offsetDartk)
                  .attr("stop-color",  darkColor)
                  .attr("stop-opacity", 1);

              return id ;
          };

          var greenGrad =  getGradient(myContainer,"greenGrad",  "#56D431" , "25%","#4FFC20" , "75%" );
          var orangeGrad =  getGradient(myContainer,"orangeGrad",  "#F1661F" , "30%","#F17C2A" , "70%" );
          var greyGrad =  getGradient(myContainer,"greyGrad",   "#A1ABB9", "30%","#CBD0D6" , "70%" ); //

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
          ticks: 24,
          greenColor : "url(#greenGrad)"  ,
          faceColor : "url(#orangeGrad)",
          greyColor : "url(#greyGrad)"
        };

        gauges[name] = new Gauge(myContainer, name, config);
        readings[name]  = {
              onTrackPct : 0,
              underPerforming : 0,
              others : 0,
              onTrack : 0,
              totalCampaigns : 0
          };

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
          this.config.greyColor = configuration.greyColor || greyColor;
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
            .attr("height", this.myContainer.height);

          this.leftArc = createArc(currentGauge.leftArcClickHandler, this.body, self.config.cx, self.config.cy, -this.config.max/2, 0, this.config.greenColor);
          this.rightArc = createArc(currentGauge.rightArcClickHandler, this.body, self.config.cx, self.config.cy, this.config.max/2, -this.config.max + this.config.min - 5, this.config.faceColor);
        //  this.greyArc = createArc(currentGauge.greyArcClickHandler, this.body, self.config.cx, self.config.cy, -this.config.max/2,  -this.config.max + this.config.min + 5 , this.config.greyColor);
          this.outerArc = createArc(undefined, this.body, self.config.cx, self.config.cy, -this.config.max/2, this.config.max, lightBlue, 1, outerArcFunc);

          var leftDotPt = {x: self.config.cx -10 - this.config.outerRingR2 - 10, y:self.config.cy + this.config.outerRingR2 + 14};
          var rightDotPt = {x: self.config.cx + this.config.outerRingR2 - 120, y: leftDotPt.y };
          this.leftDot = createCircle(this.body, leftDotPt.x, leftDotPt.y, greenColor, 5);
          this.rightDot = createCircle(this.body, rightDotPt.x, rightDotPt.y, orangeColor, 5);
//          this.rightDot =
          this.svgText = createText(this.myContainer, this.config.cx-12, this.config.cy +10, "0", "sans-serif", 30, "bold", "black");
          this.rightDotText = createText(this.myContainer, rightDotPt.x + 10, rightDotPt.y + 5, "0", "Avenir", 14, "", "#57606d");
          this.leftDotText = createText(this.myContainer, leftDotPt.x + 10, leftDotPt.y + 5, "0", "Avenir", 14, "", "#57606d");

          this.pctX = this.config.cx + 6;
          this.pctTxt = this.myContainer.append("text")
            .attr("x", this.pctX)
            .attr("y", this.config.cy+5)
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
            .attr("x", function(){
                  if (text == 0){
                      return x+5;
                  } else{
                      return x;
                  }
              })
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

          var obj = container.append("svg:path")
            .style("fill", color)
            .datum({endAngle: self.valueToRadians(endAngle)})
            .attr("d", arcFunc)
            .style("opacity", opacity)
            .attr("transform", function () {
              return "translate(" + x + ", " + y + ") rotate(" + initialAngle + ")";
            })
            if(clickHandler !== undefined) {
              obj = obj.on('click', clickHandler)
                       .style("cursor", "pointer");
            }
          return obj;
        }

        this.animateArcs = function() {
          var readingValue = getReadingValue(name, this.config.max);
          if(readingValue === 0) readingValue = 0;
          this.leftArc.transition()
            .duration(this.config.animeDuration)
            .call(arcTween, this.valueToRadians(readingValue));
          animateRightArc();
        };
        function animateRightArc() {
          var readingValue = -280 + getReadingValue(name, self.config.max);
          self.rightArc.transition()
            .duration(self.config.animeDuration)
            .call(arcTween, self.valueToRadians(readingValue))
        }
        this.animateText = function() {
          var self = this;
          this.svgText
            .transition()
              .attr("x",function(){
                  if(readings[name].onTrackPct == 100){
                      return (self.pctX -35 );
                  }

                  else if(readings[name].onTrackPct >10){
                      return self.pctX -23 ;
                  }
                  else if(readings[name].onTrackPct <10){
                      return self.pctX -17 ;
                  }
              })
            .duration(this.config.animeDuration)
            .tween("text", function() {
              return function(t) {
                var i = d3.interpolate(this.textContent, readings[name].onTrackPct);
                this.textContent = Math.round(i(t));
                if(this.textContent === '100') {
                  self.pctTxt.attr("x", self.pctX + 15)
                } else if(parseInt(this.textContent) < 10)
                {
                  self.pctTxt.attr("x", self.pctX );
                } else
                {
                  self.pctTxt.attr("x", self.pctX+12);
                }
//                self.pctTxt.attr("x", this.x.baseVal["0"].value + 33);
              };
            });
        };

        this.redraw = function () {
            if(readings[name].onTrackPct !== undefined){
                this.animateArcs();
                this.animateText();
                //hardcoding widget message right now, later move it to config to generalize for gauge
                this.leftDotText.text(readings[name].onTrack.toString() + ' On Track');
                this.rightDotText.text( readings[name].underPerforming.toString() + ' Underperforming');
            }
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
      templateUrl: assets.html_gauge
    }
  })
}());

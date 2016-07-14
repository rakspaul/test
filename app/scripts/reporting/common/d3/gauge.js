define(['angularAMD','../../../common/services/constants_service'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.service('gauge', function ($window, constants) {
        var gauges = [],
            dashContainer,
            readings = [],
            configs = [],
            greenColor = '#3BD400',
            lightColor = '#EEEEEE',
            orangeColor = '#F1661F',
            lightBlue = '#D4DFE6',
            greyColor = '#C0C7D0',
            currentGauge = this;

        function getReadingValue (name, max) {
            return (readings[name].onTrackPct !== undefined) ? readings[name].onTrackPct * max / 100 : 0;
        }

        this.setMessage = function (key, msg) {
            configs[key].msg = msg;
        };

        this.updateGauge = function (key, value) {
            readings[key] = {
                onTrackPct : value.onTrackPct,
                onTrack : value.onTrack,
                underPerforming : value.underPerforming ,
                others : value.others,
                totalCampaigns : value.totalCampaigns
            };

            gauges[key].redraw(key);
        };

        this.setLeftArcClickHandler = function (value) {
            currentGauge.leftArcClickHandler = value;
        };

        this.setRightArcClickHandler = function (value) {
            currentGauge.rightArcClickHandler = value;
        };

        this.createGauge = function () {
            function createDashboard() {
                createDash();
                createGauge(dashContainer, constants.GAUGE_PERFORMANCE, '', 40, 165,112);
            }

            function createDash() {
                // chartContainer
                var body = d3 // jshint ignore:line
                    .select('#dashboardContainer')
                    .attr('id', 'dashboardContainer')
                    .append('svg:svg')
                    .attr('class', 'dash')
                    .attr('width', 350)
                    .attr('height', 280);

                dashContainer =  body
                    .append('svg:g')
                    .attr('class', 'dashContainer')
                    .attr('id','dashContainer')
                    .attr('width',500)
                    .attr('height',300);
            }

            function createGauge(myContainer, name, label, sizebias, containerOffsetx, containerOffsety) {
                var minSize = 120,

                    getGradient = function (container, id, lightColor, offsetLight, darkColor, offsetDartk) {
                        id = container.append('svg:defs')
                            .append('svg:linearGradient')
                            .attr('id', id)
                            .attr('x1', '0%')
                            .attr('y1', '0%')
                            .attr('x2', '0%')
                            .attr('y2', '100%')
                            .attr('spreadMethod', 'pad');

                        id.append('svg:stop')
                            .attr('offset', offsetLight)
                            .attr('stop-color', lightColor)
                            .attr('stop-opacity', 1);

                        id.append('svg:stop')
                            .attr('offset', offsetDartk)
                            .attr('stop-color',  darkColor)
                            .attr('stop-opacity', 1);

                        return id;
                    },

                    greenGrad = // jshint ignore:line
                        getGradient(myContainer, 'greenGrad',  '#56D431' , '25%','#4FFC20' , '75%'),

                    orangeGrad = // jshint ignore:line
                        getGradient(myContainer, 'orangeGrad',  '#F1661F' , '30%','#F17C2A' , '70%'),

                    greyGrad = // jshint ignore:line
                        getGradient(myContainer, 'greyGrad',   '#A1ABB9', '30%','#CBD0D6' , '70%'),

                    config = {
                        size: minSize + sizebias,
                        innerRadius: (minSize + sizebias) / 3.5,
                        outerRadius: (minSize + sizebias) * 0.55,
                        outerRingR1: (minSize + sizebias) * 0.65,
                        outerRingR2: (minSize + sizebias) * 0.70,
                        animeDuration: 500,
                        cx: containerOffsetx,
                        cy: containerOffsety,
                        label: label,
                        min: 0,
                        max: 280,
                        ticks: 24,
                        greenColor : 'url(#greenGrad)',
                        faceColor : 'url(#orangeGrad)',
                        greyColor : 'url(#greyGrad)'
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
                var self = this,
                    arc,
                    outerArcFunc;

                //Explained example available at http://bl.ocks.org/mbostock/5100636
                function arcTween(transition, newAngle) {
                    transition.attrTween('d', function (d) {
                        var interpolate = d3.interpolate(d.endAngle, newAngle); // jshint ignore:line

                        return function (t) {
                            d.endAngle = interpolate(t);
                            return arc(d);
                        };
                    });
                }

                function createText(container, x, y, text, fontFamily, fontSize, fontWeight, fill) {
                    return container
                        .append('text')
                        .attr('x', function () {
                            if (text === 0) {
                                return x+5;
                            } else{
                                return x;
                            }
                        })
                        .attr('y', y)
                        .text('0')
                        .attr('font-family', fontFamily)
                        .attr('font-size', fontSize + 'px')
                        .attr('font-weight', fontWeight)
                        .attr('fill', fill);
                }

                function createCircle(container, x, y, color, radius) {
                    container
                        .append('circle')
                        .attr('r', radius)
                        .attr('fill', color)
                        .attr('transform', function () {
                            return 'translate(' + x + ', ' + y +')';
                        });
                }

                function createArc(clickHandler, container, x, y, initialAngle, endAngle, color, opacity, arcFunc) {
                    var obj;

                    if (opacity === undefined) {
                        opacity = 1;
                    }

                    if (arcFunc === undefined) {
                        arcFunc = arc;
                    }

                    obj = container.append('svg:path')
                        .style('fill', color)
                        .datum({endAngle: self.valueToRadians(endAngle)})
                        .attr('d', arcFunc)
                        .style('opacity', opacity)
                        .attr('transform', function () {
                            return 'translate(' + x + ', ' + y + ') rotate(' + initialAngle + ')';
                        });

                    if (clickHandler !== undefined) {
                        obj = obj.on('click', clickHandler)
                            .style('cursor', 'pointer');
                    }

                    return obj;
                }

                function animateRightArc() {
                    var readingValue = -280 + getReadingValue(name, self.config.max);

                    self
                        .rightArc
                        .transition()
                        .duration(self.config.animeDuration)
                        .call(arcTween, self.valueToRadians(readingValue));
                }

                this.name = name;
                this.myContainer = myContainer;

                this.configure = function (configuration) {
                    this.config = configuration;
                    this.config.radius = this.config.size / 2;
                    this.config.min = configuration.min || 0;
                    this.config.max = configuration.max || 100;
                    this.config.range = this.config.max - this.config.min;
                    this.config.ticks = configuration.ticks || 23;
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
                    var leftDotPt = {x: self.config.cx -10 - this.config.outerRingR2 - 10,
                            y:self.config.cy + this.config.outerRingR2 + 14},

                        rightDotPt = {x: self.config.cx + this.config.outerRingR2 - 120, y: leftDotPt.y},
                        faceContainer,
                        bandsContainer,
                        ticksContainer;

                    this.myContainer.selectAll('svg').remove();
                    this.myContainer.selectAll('path').remove();

                    this.body = this
                        .myContainer
                        .append('svg:svg')
                        .attr('class', 'gauge')
                        .attr('x', this.myContainer.x)
                        .attr('y', this.myContainer.y)
                        .attr('width', this.myContainer.width)
                        .attr('height', this.myContainer.height);

                    this.leftArc = createArc(currentGauge.leftArcClickHandler, this.body, self.config.cx,
                        self.config.cy, -this.config.max / 2, 0, this.config.greenColor);

                    this.rightArc = createArc(currentGauge.rightArcClickHandler, this.body, self.config.cx,
                        self.config.cy, this.config.max / 2, -this.config.max + this.config.min + 5,
                        this.config.faceColor);

                    this.outerArc = createArc(undefined, this.body, self.config.cx, self.config.cy,
                        -this.config.max / 2, this.config.max, lightBlue, 1, outerArcFunc);

                    this.leftDot = createCircle(this.body, leftDotPt.x, leftDotPt.y, greenColor, 5);
                    this.rightDot = createCircle(this.body, rightDotPt.x, rightDotPt.y, orangeColor, 5);

                    this.svgText = createText(this.myContainer, this.config.cx-12, this.config.cy +10,
                        '0', 'sans-serif', 30, 'bold', 'black');

                    this.rightDotText = createText(this.myContainer, rightDotPt.x + 10, rightDotPt.y + 5,
                        '0', 'Avenir', 14, '', '#57606d');

                    this.leftDotText = createText(this.myContainer, leftDotPt.x + 10, leftDotPt.y + 5,
                        '0', 'Avenir', 14, '', '#57606d');

                    this.pctX = this.config.cx + 6;

                    this.pctTxt = this.myContainer.append('text')
                        .attr('x', this.pctX)
                        .attr('y', this.config.cy+5)
                        .text('%')
                        .attr('font-family', 'sans-serif')
                        .attr('font-size', '14px')
                        .attr('font-weight', 'bold')
                        .attr('fill', 'black');

                    faceContainer = this.body.append('svg:g').attr('class', 'faceContainer');
                    bandsContainer = this.body.append('svg:g').attr('class', 'bandsContainer');
                    ticksContainer = this.body.append('svg:g').attr('class', 'ticksContainer');
                };

                arc = d3 // jshint ignore:line
                    .svg.
                    arc()
                    .startAngle(this.valueToRadians(this.config.min))
                    .innerRadius(this.config.innerRadius)
                    .outerRadius(this.config.outerRadius);

                outerArcFunc = d3 // jshint ignore:line
                    .svg
                    .arc()
                    .startAngle(this.valueToRadians(this.config.min))
                    .innerRadius(this.config.outerRingR1)
                    .outerRadius(this.config.outerRingR2);

                this.animateArcs = function () {
                    var readingValue = getReadingValue(name, this.config.max);

                    if (readingValue === 0) {
                        readingValue = 0;
                    }

                    this.leftArc.transition()
                        .duration(this.config.animeDuration)
                        .call(arcTween, this.valueToRadians(readingValue));

                    animateRightArc();
                };

                this.animateText = function () {
                    var self = this;

                    this
                        .svgText
                        .transition()
                        .attr('x',function () {
                            if (readings[name].onTrackPct === 100) {
                                return (self.pctX -35);
                            }

                            else if (readings[name].onTrackPct >= 10) {
                                return self.pctX -23;
                            }
                            else if (readings[name].onTrackPct <= 10) {
                                return self.pctX -17;
                            }
                        })
                        .duration(this.config.animeDuration)
                        .tween('text', function () {
                            return function (t) {
                                var i = d3 // jshint ignore:line
                                    .interpolate(this.textContent, readings[name].onTrackPct);

                                this.textContent = Math.round(i(t));

                                if (this.textContent === '100') {
                                    self.pctTxt.attr('x', self.pctX + 15);
                                } else if (parseInt(this.textContent) < 10) {
                                    self.pctTxt.attr('x', self.pctX);
                                } else {
                                    self.pctTxt.attr('x', self.pctX+12);
                                }
                            };
                        });
                };

                this.redraw = function () {
                    if (readings[name].onTrackPct !== undefined) {
                        this.animateArcs();
                        this.animateText();

                        //hardcoding widget message right now, later move it to config to generalize for gauge
                        this.leftDotText.text(readings[name].onTrack.toString() + ' On Track');
                        this.rightDotText.text(readings[name].underPerforming.toString() + ' Underperforming');
                    }
                };
            }

            createDashboard();
        };
    });
});

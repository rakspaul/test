(function () {
    "use strict";
    dashboardModule.controller('DashboardController_2', function ($scope, $rootScope, constants, dashboardModel, advertiserModel, brandsModel, campaignSelectModel, loginModel, analytics) {
        $(".main_navigation_holder").find('.active_tab').removeClass('active_tab') ;
        $(".main_navigation").find('.active').removeClass('active').end().find('#dashboard_nav_link').addClass('active');
        $scope.textConstants = constants;
        
        //Header Label Scroll Y
        $scope.scrollRightLabel = function () {
            $('.chartLegend').css({'float': 'right'});
            
            //$('.chartLegend').animate({ 'float': 'right' },  "fast");
            
            $('.scrollLeftLabel').hide();
            $('.scrollRightLabel').show();
        }
        
        $scope.scrollLeftLabel = function () {
            $('.chartLegend').animate({'float': 'left'});
            $('.scrollLeftLabel').show();
            $('.scrollRightLabel').hide();
        }
        

        //Responsive Size Changes
            var wrapWidth = $("#gaugeChart").width();
            var wrapHeight = $("#gaugeChart").height();
        
        $(window).resize(function(){
            var wrapWidth = $("#gaugeChart").width();
            var wrapHeight = $("#gaugeChart").height();
        });
        
        //Donut Chart
        var agg = { label: 'Total Budget', amountCal: '$'+'200,00', pct: [10, 30, 10, 25, 25] },
        
            data = agg;
        
        var labels = [data.pct[0]+'%', data.pct[1]+'%', data.pct[2]+'%', data.pct[3]+'%', data.pct[4]+'%'];
        
        var w = wrapWidth - 10,            // width
            h = 320,
            r = Math.min(w, h) / 2,        // arc radius
            dur = 750,                     // duration, in milliseconds
            color = d3.scale.ordinal()
                    .domain([data.pct[0], data.pct[1], data.pct[2], data.pct[3], data.pct[4]])
                    .range(["#9ed0e5", "#f9a966" , "#66bc81", "#ed7369" , "#ffdf8f"]),
            donut = d3.layout.pie().sort(null),
            arc = d3.svg.arc().innerRadius(r - 70).outerRadius(r - 20);
        
        // ---------------------------------------------------------------------
        var svg = d3.select("#gaugeChart").append("svg:svg")
            .attr("width", w).attr("height", h);
        
        var arc_grp = svg.append("svg:g")
            .attr("class", "arcGrp")
            .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");
        
        var label_group = svg.append("svg:g")
            .attr("class", "lblGroup")
            .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");
        
        // GROUP FOR CENTER TEXT
        var center_group = svg.append("svg:g")
            .attr("class", "ctrGroup")
            .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");
        
        // CENTER LABEL
        var pieLabel = center_group.append("svg:text")
            .attr("dy", ".35em").attr("class", "chartLabel")
            .attr("text-anchor", "middle")
            .text(data.label);
        
        // DRAW ARC PATHS
        var arcs = arc_grp.selectAll("path")
            .data(donut(data.pct));
        arcs.enter().append("svg:path")
            .attr("stroke", "white")
            .attr("stroke-width", 0)
            .attr("fill", function(d, i) {return color(i);})
            .attr("d", arc)
            .each(function(d) {this._current = d});
        
        // DRAW SLICE LABELS
        var sliceLabel = label_group.selectAll("text")
            .data(donut(data.pct));
        sliceLabel.enter().append("svg:text")
            .attr("class", "arcLabel")
            .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
            .attr("text-anchor", "middle")
            .text(function(d, i) {return labels[i]; });
        
        // --------- "PAY NO ATTENTION TO THE MAN BEHIND THE CURTAIN" ---------
        
        // Store the currently-displayed angles in this._current.
        // Then, interpolate from this._current to the new angles.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
                return arc(i(t));
            };
        }
        
        // update chart
        function updateChart(model) {
            data = eval(model); // which model?
        
            arcs.data(donut(data.pct)); // recompute angles, rebind data
            arcs.transition().ease("elastic").duration(dur).attrTween("d", arcTween);
        
            sliceLabel.data(donut(data.pct));
            sliceLabel.transition().ease("elastic").duration(dur)
                .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
                .style("fill-opacity", function(d) {return d.value==0 ? 1e-6 : 1;});
                
            pieLabel.text(data.label);
        }
        
        
    })
}());
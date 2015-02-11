(function() {
    "use strict";
    commonModule.service("screenChart", function($rootScope,constants) {


        function updateScreenChartData(data){
            this.screenData = data ;

            createScreenChart.call(this, this.screenData);
        };

        this.updateScreenChartData = updateScreenChartData ;

        function createScreenChart(data) {
            console.log("screenChar.js : create screen chart ");
            if(data !== undefined && data.total_brands == 1 &&  data['brands'][0].budget == 0){
                $("#data_not_available").show();
            }

            var brands_svg  = d3.select("#screens").append("svg")
                .attr("width", 400)
                .attr("height", 280)
                .attr("id",  "screen_svg")
                .append("g");


            var node = brands_svg.selectAll(".node")
                .data(data)
                .enter()
                .append("g")
                .attr("class" , "node") ;

        } ;

    });
}());

(function() {
    "use strict";
    commonModule.directive("screenChart", function () {
        return {
            restrict: 'EAC',
            templateUrl: 'screen_chart'
        }
    })
}());

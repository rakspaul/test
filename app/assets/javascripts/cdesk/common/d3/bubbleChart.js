(function() {
    "use strict";
    commonModule.service("bubbleChart", function($rootScope,constants, brandsModel, loginModel, analytics) {

        var brands_svg = {},
            campaigns_svg = {} ,
            chartData = {},
            node = {} , blueGradient = {}, orangeGradient = {}, greenGradient = {} ;



        var tooltipBackGroundColor = "#FEFFFE";





        var colors = {
            brands : {
                circleFill : "#0F62BC ",
                spendFillLight :  "url(#blueGradient)",
                spendPathOutline :   "#085f9f"

            },
            campaigns : {
                onTrack : {
                    circleFill :   "#56D431",
                    spendFillLight :  "url(#greenGradient)",
                    spendPathOutline :   "#379B1C"
                },
                underPerforming : {
                    circleFill : "#F1661F" ,
                    spendFillLight :    "url(#orangeGradient)",
                    spendPathOutline :  "#DB530F"
                }
            }
        };



        var getRepString = function(x ,r) {
            //if(isNaN(x)) return x;
            var y = Math.abs(x);

            if(y < 999) {
                return  "$" + ((r > 40) ? x.toFixed(2) : x.toFixed(0));
            }
            if(y < 9999) {
                var  x = x/1000 ;

                return  "$" + ((r >40) ? x.toFixed(2)  : x.toFixed(0))+ "k";
            }

            if(y < 1000000) {
                var x = x/1000;

                return "$" + ((r >40) ? x.toFixed(2) : x.toFixed(0)) + "k";
            }
            if( y < 10000000) {
                var x = x/1000000 ;

                return "$"+ ((r >40) ? x.toFixed(2)  : x.toFixed(0)) + "m";
            }

            if(y < 1000000000) {
                var x = x/1000000 ;

                return "$" +  ((r >40) ? x.toFixed(2)  : x.toFixed(0)) + "m";
            }

            if(y < 1000000000000) {
                var x= x/1000000000 ;
                return "$"+  ((r >40) ? x.toFixed(2)  : x.toFixed(0 )) + "b";
            }

            return "1T+";
        };

        var dataGenerator = function(x, y , r ,perc ){
            var lineData = [];
            if(r >0 ){
                var xstart, xend, ystart ;

                if(perc<99){
                    // To set curviness of the circle filling 1st criteria is r
                    var ycurviness = 8;
                    if(r<10)
                        ycurviness = 0;
                    if(r<18)
                        ycurviness = 3;
                    if(r<30)
                        ycurviness = 5;
                    else if(r < 50)
                        ycurviness = 8;
                    else if( r < 60)
                        ycurviness =10;

                    // To set curviness 2nd criteria is percentage fill
                    if(perc >90)
                        ycurviness =3 ;


                    var startangle = Math.atan(1 - perc/50);

                    for(var angle = startangle; angle < (Math.PI - startangle); angle = angle +((Math.PI)/180 *4) ){

                        var newCordinates = {
                            "x" : x -(r)*Math.cos(angle),
                            "y" :  y+ (r)*Math.sin(angle)
                        };

                        lineData.push(newCordinates);
                    }

                    xstart = lineData[0].x ;
                    ystart = lineData[0].y ;

                    xend = lineData[lineData.length -1].x ;

                    var middle   = {
                        "x" : xstart + ( xend - xstart)/2 ,
                        "y" : ystart
                    };

                    var firstMiddle   = {
                        "x" : xstart + (middle.x - xstart) /2 ,
                        "y" : middle.y + ycurviness
                    };


                    var secondMiddle   = {
                        "x" :  middle.x + ( xend - middle.x) / 2 ,
                        "y" : middle.y - ycurviness
                    };

                    lineData.push(secondMiddle);
                    lineData.push(middle);
                    lineData.push(firstMiddle);
                    lineData.push(lineData[0]);

                }else{

                    for(var angle = 0; angle < (2*Math.PI); angle = angle +((Math.PI)/180 *8) ){
                        var newCordinates = {
                            "x" : x -(r)*Math.cos(angle),
                            "y" :  y+ (r)*Math.sin(angle)
                        };

                        lineData.push(newCordinates);
                    }
                    xend = x+r;
                    ystart = y ;
                }

            }
            return {
                lineData : lineData,
                curveEndX : xend,
                curveEndY : ystart
            } ;
        };

        function dataFormatting (root , spanId){

            var positions =  [[72,80],[240,60],[165,160],[290,220] ,[60,220],[165,240]];
            var formattedData = [];
            var array = root;
            var maxRadius = (spanId == 'brands') ? 70 : 60 ;

            var maxBudget = (array == undefined || array[0] == undefined) ? 0 : array[0].budget ;
            var ratio = (maxBudget == 0)? 0 : maxRadius / maxBudget ;

            for(var i in array){
                var node = array[i];
                var percFill =0 ;
                var radius  = 0 ;
                if(node.budget > 0 ){
                    percFill   = Math.round((node.spend / node.budget)* 100);

                    radius = ((node.budget)*ratio < 30 )? 30 : ( (node.budget)*ratio < 40 ?  ( node.budget*ratio + 5 ): (node.budget)*ratio  );
                }
                var pathData =  dataGenerator(positions[i][0], positions[i][1], radius, percFill );
                

                var object = {
                    id:  i ,
                    brandId: node.id,
                    className: node.name,
                    value : node.budget,
                    budget :node.budget,
                    spend : node.spend,
                    percFill : percFill,
                    campaigns : node.campaigns,
                    cx : positions[i][0],
                    cy : positions[i][1],
                    r : radius,
                    status : (spanId == 'brands') ? 'brands' :  node.kpi_status ,
                    pathData : pathData['lineData'],
                    toolTipX : pathData['curveEndX'],
                    toolTipY : pathData['curveEndY'],
                    objectType : (spanId == 'brands')? 'brands' : 'campaigns'
                };
                formattedData.push(object);
            }


            return formattedData ;
        };

        function updateBubbleChartData( spanId, data){

            $("#brands").show();
            $("#campaigns").hide();
            this.spendData = data ;
            createBubbleChart.call(this, spanId, this.spendData);

        };


        this.updateBubbleChartData = updateBubbleChartData ;

        function createBubbleChart(spanId, data) {

                brands_svg = {},
                campaigns_svg = {} ,
                chartData = {},
                node = {} ;

            d3.select("#brands_svg").remove();
            d3.select("#campaigns_svg").remove();


            if(spanId == "brands"){
                $("#brands").show();
                $("#campaigns").hide();

                 brands_svg  = d3.select("#brands").append("svg")
                    .attr("width", 350)
                    .attr("height", 280)
                    .attr("id",  spanId + "_svg")
                    .append("g");

                 chartData =  dataFormatting(data,spanId) ;

                 node = brands_svg.selectAll(".node")
                    .data(chartData)
                    .enter()
                    .append("g")
                    .attr("class" , "node") ;

                  blueGradient = node.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "blueGradient")
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "0%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");

// Define the gradient colors
                blueGradient.append("svg:stop")
                    .attr("offset", "25%")
                    .attr("stop-color", "#1F9FF4")
                    .attr("stop-opacity", 1);

                blueGradient.append("svg:stop")
                    .attr("offset", "75%")
                    .attr("stop-color",  "#1B7FE2")
                    .attr("stop-opacity", 1);

                var tooltip = d3.select(".dashboard_budget_graph_holder .dashboard_perf_graph")
                    .append("div")
                    .attr("class" , "bubble_tooltip")
                    .attr("id","bubbleChartTooltip")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("display", "none")
                    .style("color", "black")
                    .style("padding", "5px 20px")
                    .style("background-color", tooltipBackGroundColor)
                    .style("border-radius", "4px")
                    .style("-webkit-border-radius", "4px")
                    .style("-moz-border-radius", "4px")
                    .style("border" , "solid 1px #ccc")
                    .style("word-wrap", "break-word")
                    .style("box-shadow", "0px 0px 2px #ccc")
                    .style("font", "14px Avenir")
                    .style("text-alignt","center")
                    .style("font-weight","500")
                    .style("width","200px")
                    .text("tooltip");



            } else if(spanId == "campaigns"){
                $("#brands").hide();
                $("#campaigns").show();

                 campaigns_svg  = d3.select("#campaigns").append("svg")
                    .attr("width", 350)
                    .attr("height", 280)
                    .attr("id",  "campaigns_svg")
                    .append("g");

                 chartData =  dataFormatting(data,spanId) ;


                 node = campaigns_svg.selectAll(".node")
                    .data(chartData).enter()
                    .append("g")
                    .attr("class" , "node");

              greenGradient = node.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "greenGradient")
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "0%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");

// Define the gradient colors
                greenGradient.append("svg:stop")
                    .attr("offset", "25%")
                    .attr("stop-color", "#59F42D")
                    .attr("stop-opacity", 1);

                greenGradient.append("svg:stop")
                    .attr("offset", "75%")
                    .attr("stop-color", "#45D11F")
                    .attr("stop-opacity", 1);

                 orangeGradient = node.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "orangeGradient")
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "0%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");

// Define the gradient colors
                orangeGradient.append("svg:stop")
                    .attr("offset", "30%")
                    .attr("stop-color", "#FC8732")
                    .attr("stop-opacity", 1);


                orangeGradient.append("svg:stop")
                    .attr("offset", "70%")
                    .attr("stop-color", "#FC782A")
                    .attr("stop-opacity", 1);

                var tooltip = d3.select(".dashboard_budget_graph_holder .dashboard_perf_graph")
                    .append("div")
                    .attr("class" , "bubble_tooltip")
                    .attr("id","bubbleChartTooltip")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("display", "none")
                    .style("color", "black")
                    .style("padding", "5px 20px")
                    .style("background-color", tooltipBackGroundColor)
                    .style("border-radius", "4px")
                    .style("-webkit-border-radius", "4px")
                    .style("-moz-border-radius", "4px")
                    .style("border" , "solid 1px #ccc")
                    .style("word-wrap", "break-word")
                    .style("box-shadow", "0px 0px 2px #ccc")
                    .style("font", "14px Avenir")
                    .style("text-alignt","center")
                    .style("font-weight","500")
                    .style("width","300px")
                    .text("tooltip");

            }

            var lineFunction = d3.svg.line()
                .x(function(d){
                    return d.x ;})
                .y(function(d){
                    return d.y;})
                .interpolate("basis-closed");



            node.append("circle")
                .attr("id", function(d){
                  return (d.objectType == 'brands' ? "brands_" + d.id + "_circle" : "campaigns_" + d.id + "_circle" ) ;
                })
                .style("fill", function(d){
                  return  (d.objectType == 'brands') ? colors.brands.circleFill : ((d.status.toLowerCase() == 'ontrack') ? colors.campaigns.onTrack.circleFill : colors.campaigns.underPerforming.circleFill );
                })
                .attr("r" , function(d){
                    return d.r ;
                })
                .attr("cx" , function(d){
                    return d.cx ;})
                .attr("cy" , function(d){return d.cy ;});

            node.append("path")
                .attr("id", function(d){
                return ( d.objectType == 'brands' ) ? 'brands_'+  d.id +"_path" : 'campaigns_' +  d.id +"_path" ;
                })
                .attr("d",function(d){
                    return lineFunction(d.pathData);
                })
                .attr("fill",  function(d){
                    return  (d.objectType == 'brands') ? colors.brands.spendFillLight : ((d.status.toLowerCase() == 'ontrack') ? colors.campaigns.onTrack.spendFillLight : colors.campaigns.underPerforming.spendFillLight );
                });


            node.append("text") //For brand name
                .attr("transform", function(d) {
                    if(d.r > 50)
                        return "translate(" + d.cx + "," + (d.cy+35) + ")";
                    else if(d.r >40)
                        return "translate(" + d.cx + "," + (d.cy+25) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy) + ")";
                })
                .attr("font-family","Avenir")
                .style("font-weight","500")
                .style("z-index", "10")
                .style("font-size", function(d){
                    var size ;
                    if(d.r > 50 )

                        size = "12px" ;
                    else if (d.r > 40)
                        size = "10px" ;
                    else
                       size = "8px";

                    return size ;
                })
                .style("text-anchor", "middle")
                .attr("fill", "white")
                .text(function(d) {
                    var text ;
                    if(d.r > 60)
                        text = d.className.substring(0, 12) + '...' ;
                    else if(d.r > 50){
                        text = d.className.substring(0, 9) + '...' ;
                    } else if (d.r > 40){
                        text = d.className.substring(0, 6) + '...' ;
                    }
                    return text ;
                });

            node.append("text") // for brand budget
                .attr("transform", function(d) {
                    if(d.r > 50)
                        return "translate(" + d.cx + "," + (d.cy+10) + ")";
                    else if(d.r >40)
                        return "translate(" + d.cx + "," + (d.cy+2) + ")";
                    else
                        return "translate(" + d.cx + "," + (d.cy+5) + ")";
                })
                .attr("font-family","Avenir")
                .style("text-anchor", "middle")
                .attr("fill", "white")
                .style("z-index", "10")
                .attr("font-size",function(d){
                    var text_size ;
                    if(d.r > 50){
                        text_size = "26px"
                    }
                    else if(d.r > 30){
                        text_size = "20px";
                    } else {
                        text_size="14px" ;
                    }
                    return text_size ;
                })
                .attr("font-weight","500")
                .attr("fill", "white")
                .style("text-anchor", "middle")
                .text(function(d) {
                    var budget ;
                    if(d.r > 25)
                        budget = getRepString(d.budget, d.r);

                    return budget ;
                });

            node.on("mouseover", function(obj){

                var focused_obj = {
                    name : obj.className,
                    id : obj.id,
                    cx : obj.cx,
                    cy : obj.cy,
                    percFill : obj.percFill,
                    spend : obj.spend,
                    budget : obj.budget ,
                    r : obj.r,
                    objectType : obj.objectType,
                    status : obj.status ,
                    toolTipX : obj.toolTipX,
                    toolTipY : obj.toolTipY
                };


                node.selectAll("circle").attr('opacity',0.4);
                node.selectAll("path").attr('opacity', 0.4);

                var focusedObjId = (focused_obj.objectType == 'brands')? "brands_"+focused_obj.id : "campaigns_"+focused_obj.id ;

                analytics.track(loginModel.getUserRole(), 'dashboard_bubblechart_widget', (focused_obj.objectType === 'brands' ? 'brand_bubble_hover' : 'campaign_bubble_hover_' + obj.status), loginModel.getLoginName());

                d3.select("#"+focusedObjId + "_circle").attr('opacity', 1);
                d3.select("#"+focusedObjId + "_path").attr('opacity', 1);

                d3.select( "#"+ focusedObjId + "_path")
                    .attr('id', focusedObjId + "_path")
                    .attr('opacity', 1)
                   .attr("stroke" , (focused_obj.objectType == 'brands') ? colors.brands.spendPathOutline : (focused_obj.status.toLowerCase() == 'ontrack' ? colors.campaigns.onTrack.spendPathOutline : colors.campaigns.underPerforming.spendPathOutline ))
                     .attr("stroke-width", 3)
                   .attr("fill", (focused_obj.objectType == 'brands') ? colors.brands.spendFillLight : (focused_obj.status.toLowerCase() == 'ontrack' ? colors.campaigns.onTrack.spendFillLight : colors.campaigns.underPerforming.spendFillLight ));
                



                return tooltip
                  //  .attr("transform",  "translate(" + focused_obj.toolTipX + "," + focused_obj.toolTipY + ")" )
                  .html(focused_obj.name + " <br/>  <b style='display:inline-block;width:55px;'>Budget:</b>  $" + focused_obj.budget.toFixed(2).replace(/./g, function(c, i, a) {
                    return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
                }) + " <br/>  <b style='display:inline-block;width:55px;'>Spend:</b>  $" + focused_obj.spend.toFixed(2).replace(/./g, function(c, i, a) {
                    return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
                })  ).style("display", "block")
                    .style("top", function(){
                        var tooltipHeight = $("div.bubble_tooltip:visible").height() ;
                        var shift = (focused_obj.cy - (tooltipHeight/2))+"px";
                       return shift ;
                    })
                    .style("left" ,  (focused_obj.toolTipX + 10) +"px") ;


            });

            node.on("mouseout" , function(obj){
                var focused_obj = {
                    name : obj.className,
                    id : obj.id,
                    cx : obj.cx,
                    cy : obj.cy,
                    percFill : obj.percFill,
                    spend : obj.spend,
                    r : obj.r,
                    objectType : obj.objectType,
                    status : obj.status ,
                    toolTipX : obj.toolTipX,
                    toolTipY : obj.toolTipY
                };


                var focusedObjId = (focused_obj.objectType == 'brands')? "brands_"+focused_obj.id : "campaigns_"+focused_obj.id ;

                node.selectAll("circle").attr('opacity',1);
                node.selectAll("path").attr('opacity', 1);

                var id_to_remove = focusedObjId + "_path" ;

                d3.select("#"+ id_to_remove)
                    .attr('opacity', 1)
                    .attr("stroke" , (focused_obj.objectType == 'brands') ? colors.brands.spendFillLight : (focused_obj.status.toLowerCase() == 'ontrack' ? colors.campaigns.onTrack.spendFillLight : colors.campaigns.underPerforming.spendFillLight ))
                    .attr("stroke-width", 0.2)
                    .attr("fill", (focused_obj.objectType == 'brands') ? colors.brands.spendFillLight : (focused_obj.status.toLowerCase() == 'ontrack' ? colors.campaigns.onTrack.spendFillLight : colors.campaigns.underPerforming.spendFillLight ));

              return  tooltip.style("display", "none");

            });

            node.on("click", function(obj) {

                analytics.track(loginModel.getUserRole(), 'dashboard_bubblechart_widget', (obj.objectType === 'brands' ? 'brand_bubble_clicked' : 'campaign_bubble_clicked_' + obj.status), loginModel.getLoginName());
                if(obj.objectType == 'brands'){
                    tooltip.style("display", "none");
                    $rootScope.$broadcast(constants.BUBBLE_BRAND_CLICKED, obj);
                }
            });

        } ;

        this.cleaningBubbleChart = function(spanId){
            d3.select("#"+spanId+"_svg").remove();
            $("#data_not_available").hide();
        };

    });
}());

(function() {
    "use strict";
    commonModule.directive("bubbleChart", function () {
        return {
            restrict: 'EAC',
            templateUrl: '/assets/html/orders/_bubble_chart.html'
        }
    })
}());

(function() {
    "use strict";
    commonModule.service("bubbleChart", function($rootScope,constants) {

        var dark_blue = "#0978c9 " ,
            blue = "#209AEF" ,
            darkBlueOutline_popup = "#085F9F",
            orange = "#F67C29" ,
            darkOrange = "#DD6B1D",
            green ="#64EF3A",
            darkgreen = "#64D841",

            blueOutline = "#1378C3",
            greenOutline = "#64D841" ,
            orangeOutline = "#DB691C";

        var text = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("color", "black")
            .style("padding", "8px")
            .style("background-color", "rgba(1, 0, 0, 0.75)")
            .style("border-radius", "6px")
            .style("font", "12px sans-serif")
            .text("tooltip");

        var getRepString = function(x) {
            //if(isNaN(x)) return x;
            var y = Math.abs(x);

            if(y < 999)
                return  "$ " + x;

            if(y < 9999) {
                return  "$ " + Math.round(x/1000) + "k";
            }

            if(y < 1000000) {
                return "$ " + Math.round(x/1000) + "k";
            }
            if( y < 10000000) {
                return "$ "+  Math.round(x/1000000) + "m";
            }

            if(y < 1000000000) {
                return "$ " +Math.round((x/1000000)) + "m";
            }

            if(y < 1000000000000) {
                return "$ "+ Math.round((x/1000000000)) + "b";
            }

            return "1T+";
        };

        var dataGenerator = function(x, y , r ,perc ){

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
            var sin = Math.sin(startangle);
            var cos = Math.cos(startangle);

            var xstart = x - (r)*cos ;
            var ystart = y + (r)*sin ;

            var xend = x+(r)*cos ;
            var yend = y+r*sin ;

            var lineData = [];

            for(var angle = startangle; angle < (Math.PI - startangle); angle = angle +((Math.PI)/180 *8) ){

                var newx = x -(r)*Math.cos(angle);
                var newy = y+ (r)*Math.sin(angle);

                var newCordinates = {
                    "x" : newx,
                    "y" : newy
                }
                lineData.push(newCordinates);
            }

            var curvyline = [] ;
            curvyline.push(lineData[0]);
            var xstart = lineData[0].x ;
            var ystart = lineData[0].y ;
            var xend = lineData[lineData.length -1].x ;
            var yend = lineData[lineData.length -1].y ;

            var xmiddle = xstart + ( xend - xstart)/2 ;
            var ymiddle = ystart ;

            var middle   = {
                "x" : xmiddle,
                "y" : ymiddle
            }

            var xfirstmiddle = xstart + (xmiddle - xstart) /2 ;
            var yfirstmiddle = ymiddle + ycurviness ;

            var firstMiddle   = {
                "x" : xfirstmiddle,
                "y" : yfirstmiddle
            }

            var xsecondmiddle = xmiddle + ( xend - xmiddle) / 2 ;
            var ysecondmiddle = ymiddle - ycurviness ;

            var secondMiddle   = {
                "x" : xsecondmiddle,
                "y" : ysecondmiddle
            }

            lineData.push(secondMiddle);
            lineData.push(middle);
            lineData.push(firstMiddle);
            lineData.push(lineData[0]);

            return lineData ;
        };

        function dataFormatting (root , spanId){
            var positions = [[100,100],[250,100],[160,200],[60,210] ,[280,200],[[290,220]]];
           var positionsCampaigns =  [[90,80],[250,100],[175,200],[60,210] ,[290,210]];
            var formattedDataBrands = [];
            var formattedDataCampaigns = [];
            if(spanId == 'brands'){
                var brandArray = root['brands'];
                var maxRadius = 90 ;
                var maxBudget = brandArray[0].budget ;
                var ratio = maxRadius / maxBudget ;
                for(var i in brandArray){
                    var node = brandArray[i];
                    var object = {
                        id: "brand_"+ (i+1) ,
                        className: node.name,
                        value : node.budget,
                        budget :node.budget,
                        spend : node.spend,
                        percFill : Math.round((node.spend / node.budget)* 100) ,
                        campaigns : node.campaigns,
                        cx : positions[i][0],
                        cy : positions[i][1],
                        r : ((node.budget)*ratio <5 )? 5 : (node.budget)*ratio
                    };

                    formattedDataBrands.push(object);
                }
            } else if(spanId == 'campaigns'){
                var campaignArray = root['campaigns'];
                var maxRadius = 60 ;
                var maxBudget = campaignArray[0].budget ;
                var ratio = maxRadius / maxBudget ;

                for(var i in campaignArray){
                    var node = campaignArray[i];
                    var object = {
                        id: "campaign_"+ (i+1) ,
                        className: node.name,
                        value : node.budget,
                        budget :node.budget,
                        spend : node.spend,
                        status : node.status,
                        percFill : Math.round((node.spend / node.budget )* 100) ,
                        cx : positionsCampaigns[i][0],
                        cy : positionsCampaigns[i][1],
                        r : ((node.budget)*ratio <5 )? 5 : (node.budget)*ratio
                    };
                    formattedDataCampaigns.push(object);
                }

            }
            return {
                formattedDataBrands : formattedDataBrands,
                formattedDataCampaigns : formattedDataCampaigns
            } ;
        };

        function updateBubbleChartData(data){
            this.spendData = data ;

             createBubbleChartNew.call(this, "brands", this.spendData);
        };

        this.updateBubbleChartData = updateBubbleChartData ;

        function createBubbleChartNew(spanId, data) {

            var brands_svg  = d3.select("#brands").append("svg")
                .attr("width", 400)
                .attr("height", 280)
                .attr("id",  "brands_svg")
                .append("g");

            var self = this ;
        //    var bubbleContainer = createChartContainer(spanId,400, 280, 420 );

            var chartData =  dataFormatting(data,"brands")['formattedDataBrands'];

            var node = brands_svg.selectAll(".node")
                .data(chartData)
                .enter()
                .append("g")
                .attr("class" , "node") ;

            var lineFunction = d3.svg.line()
                .x(function(d){
                    return d.x ;})
                .y(function(d){
                    return d.y;})
                .interpolate("basis-closed");



            node.append("circle")
                .attr("id", function(d){
                    return (d.id +"_circle" ) ;
                })
                .attr("stroke-width", '4')
                .attr("stroke" , blueOutline)
                .style("fill", dark_blue)
                .style('opacity', 1)
                .attr("r" , function(d){
                    return d.r ;
                })
                .attr("cx" , function(d){return d.cx ;})
                .attr("cy" , function(d){return d.cy ;});

            node.append("path")
                .attr("d",function(d){
                    var dataSet = dataGenerator(d.cx, d.cy, d.r, d.percFill );
                    return lineFunction(dataSet);
                })
                .attr("stroke" , blueOutline)
                .style('opacity', 1)
                .attr("stroke-width", 4)
                .attr("fill", blue);


            node.append("title")
                .text(function(d){
                    return d.className ;});

            node.append("text") //For brand name
                .attr("transform", function(d) {
                    if(d.r > 40)
                        return "translate(" + d.cx + "," + (d.cy+35) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy+25) + ")";
                })
                .attr("font-family","Avenir")
                .style("font-weight","500")
                .style("font-size", function(d){
                    var size ;
                    if(d.r > 40 )

                    size = "16px" ;
                    else if (d.r > 25)
                    size = "14px" ;

                    return size ;
                })
                .style("text-anchor", "middle")
                .attr("fill", "white")
                .text(function(d) {
                    var text ;
                    if(d.r > 40){
                        text = d.className.substring(0, 4) + '...' ;
                    } else if (d.r > 35){
                        text = d.className.substring(0, 3) + '...' ;
                    } else if(d.r > 30) {
                        text = d.className.substring(0, 2) + '...' ;
                    }
                    return text ;
                });

            node.append("text") // for brand budget
                .attr("transform", function(d) {
                    if(d.r > 40)
                        return "translate(" + d.cx + "," + (d.cy+10) + ")";
                    else if(d.r >22)
                        return "translate(" + d.cx + "," + (d.cy) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy-1) + ")";
                })
                .attr("font-family","Avenir")
                .style("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-size",function(d){
                    var text_size ;
                    if(d.r > 65){
                        text_size = "35px"
                    }
                    else if(d.r > 50){
                        text_size = "32px";
                    }else if(d.r > 40){
                        text_size="28px";
                    } else if(d.r >25) {
                        text_size="18px" ;
                    } else if(d.r > 15){
                        text_size = "14px"
                    }
                    return text_size ;
                })
                .attr("font-weight","900")
                .attr("fill", "white")
                .style("text-anchor", "middle")
                .text(function(d) {
                    var budget ;
                    if(d.r >15)
                        budget = getRepString(d.budget);

                    return budget ;
                });


//            node.on("mouseover", function(e){
//                console.log("mouseover event");
//                console.log(e);
//                node.append("path")
//                    .attr("id",function(d){
//
//                    })
//                    .attr("d",function(d){
//                        console.log(d);
//                        var dataSet = dataGenerator(d.cx, d.cy, d.r, d.percFill );
//                        return lineFunction(dataSet);
//                    })
//                    .attr("stroke" , darkBlueOutline)
//                    .style('opacity', 1)
//                    .attr("stroke-width", 8)
//                    .attr("fill", "none");
//            });
//            node.on("mouseout" , function(d){
//                console.log("mouse out event");
//            })

            node.on("click", function(d) {


                var brand_name = d.className ;
                $rootScope.$broadcast(constants.BUBBLE_BRAND_CLICKED, brand_name);

                $("#brands").hide();
                $("#backToBrands").show();


                var campaigns = d.campaigns ;
                var data = {
                    "campaigns": campaigns
                };

               self.createBubbleChartForCampaigns("campaigns",data );

                $("#campaigns").show();
                self.first = false ;
            });
            node.data(chartData);
        } ;

        this.cleaningBubbleChart = function(spanId){
            d3.select("#"+spanId+"_svg").remove();
        };

        this.createBubbleChartForCampaigns = function( spanId , data){
          //  var campaignChartContainer = createChartContainer(spanId , 400, 280, 420);
            var campaigns_svg  = d3.select("#campaigns").append("svg")
                .attr("width", 400)
                .attr("height", 280)
                .attr("id",  "campaigns_svg")
                .append("g");

            var chartData =  dataFormatting(data,spanId)['formattedDataCampaigns'];



            var node = campaigns_svg.selectAll(".node")
                .data(chartData).enter()
                .append("g")
                .attr("class" , "node");

            var lineFunction_circle = d3.svg.line()
                .x(function(d){
                    return d.x ;})
                .y(function(d){
                    return d.y;})
                .interpolate("basis-closed");

            node.append("circle")
                .attr("id", function(d){
                    return (d.id +"_circle" ) ;
                })
                .attr("stroke-width", '4')
                .attr("stroke" , function(d){
                    if(d.status === 'ontrack') return greenOutline  ;
                    else if(d.status === 'underperforming') return orangeOutline;
                })
                .attr("fill",function(d){

                    if(d.status === 'ontrack') {
                          return darkgreen  ;
                    }
                    else if(d.status === 'underperforming') {
                        return darkOrange
                    }
                })
                .attr("r" , function(d){
                    return d.r ;
                })
                .attr("cx" , function(d){return d.cx ;})
                .attr("cy" , function(d){return d.cy ;});

            node.append("path")
                .attr("d",function(d){
                    var dataSet = dataGenerator(d.cx, d.cy, d.r, d.percFill );
                    return lineFunction_circle(dataSet);
                })
                .attr("stroke" , function(d){
                    if(d.status === 'ontrack') return greenOutline  ;
                    else if(d.status === 'underperforming') return orangeOutline;
                })
                .attr("fill",function(d) {
                    if (d.status === 'ontrack')  return green;

                    else if (d.status === 'underperforming')   return orange ;
                }) ;

                    node.append("title")
                        .text(function (d) {
                            return d.className;
                        });


            node.append("text") //For brand name
                .attr("transform", function(d) {
                    if(d.r > 40)
                        return "translate(" + d.cx + "," + (d.cy+35) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy+20) + ")";
                })
                .attr("font-family","Avenir")
                .style("font-size", function(d){
                    var size ;
                    if(d.r > 40 )
                        size = "16px" ;
                    else if (d.r > 25)
                        size = "14px" ;
                    return size ;
                })
                .style("text-anchor", "middle")
                .attr("font-weight","500")
                .attr("fill", "white")
                .text(function(d) {
                    var text ;
                    if(d.r > 40){
                        text = d.className.substring(0, 4) + '...' ;
                    } else if (d.r > 25){
                        text = d.className.substring(0, 3) + '...' ;
                    }
                    return text ;
                });

            node.append("text") // for brand budget
                .attr("transform", function(d) {
                    if(d.r > 40)
                        return "translate(" + d.cx + "," + (d.cy+10) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy+5) + ")";
                })
                .attr("font-family","Avenir")
                .style("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-size",function(d){
                    var text_size ;
                    if(d.r > 65){
                        text_size = "35px"
                    }
                    else if(d.r > 50){
                        text_size = "32px";
                    }else if(d.r > 40){
                        text_size="28px";
                    } else if(d.r >25) {
                        text_size="18px" ;
                    } else if(d.r > 15){
                        text_size = "14px"
                    }
                    return text_size ;
                })
                .attr("font-weight","900")
                .attr("fill", "white")
                .style("text-anchor", "middle")
                .text(function(d) {
                    var budget ;
                    if(d.r >15)
                        budget = getRepString(d.budget);

                    return budget ;
                });

            };

    });
}());

(function() {
    "use strict";
    commonModule.directive("bubbleChart", function () {
        return {
            restrict: 'EAC',
            templateUrl: 'bubble_chart'
        }
    })
}());
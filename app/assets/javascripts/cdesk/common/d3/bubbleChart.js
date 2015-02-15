(function() {
    "use strict";
    commonModule.service("bubbleChart", function($rootScope,constants) {

        var darkblue = "#0978c9 " ,
            blue = "#209AEF" ,

            orange = "#F1661F" , // #FC812F
            darkOrange = "#F1661F",

            green ="#59F52D",
            darkgreen = "#56D431",

            blueOutline = "#1378C3",
            darkBlueOutline = "#085F9F",

            greenOutline = "#64D841" ,
            darkGreenOutline = "#47AB1D",

            orangeOutline = "#DB691C",
            darkOrangeOutline ="#DB530F",

           tooltipBackGroundColor = "#FEFFFE";


        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
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
            var lineData = [];
            if(r >0 ){

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

                    var xstart = lineData[0].x ;
                    var ystart = lineData[0].y ;

                    var xend = lineData[lineData.length -1].x ;

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
                }

            }
            return lineData ;
        };

        function dataFormatting (root , spanId){
            var positions = [[100,100],[250,100],[160,200],[60,210] ,[280,200],[[290,220]]];
           var positionsCampaigns =  [[90,80],[250,100],[175,200],[60,210] ,[290,210]];
            var formattedDataBrands = [];
            var formattedDataCampaigns = [];
            if(spanId == 'brands'){
                var brandArray = root['brands'];
                var maxRadius = 70 ;
                //console.log(brandArray[0] + " brandArray[0]");

                var maxBudget = (brandArray == undefined || brandArray[0] == undefined) ? 0 : brandArray[0].budget ;
                var ratio = (maxBudget == 0)? 0 : maxRadius / maxBudget ;
                for(var i in brandArray){
                    var node = brandArray[i];
                    var percFill =0 ;
                    var radius  = 0 ;
                    if(node.budget > 0 ){
                      percFill   = Math.round((node.spend / node.budget)* 100);
                      radius = ((node.budget)*ratio <5 )? 5 : (node.budget)*ratio ;
                    }
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
                        r : radius
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
                    var percFill = 0 ;
                    var radius  = 0 ;
                    if(node.budget > 0 ){
                        percFill   = Math.round((node.spend / node.budget)* 100);
                        radius = ((node.budget)*ratio <5 )? 5 : (node.budget)*ratio ;
                    }
                    var object = {
                        id: i ,
                        className: node.name,
                        value : node.budget,
                        budget :node.budget,
                        spend : node.spend,
                        status : node.kpi_status,
                        percFill : percFill ,
                        cx : positionsCampaigns[i][0],
                        cy : positionsCampaigns[i][1],
                        r : radius
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
            if(data !== undefined && data.total_brands == 1 &&  data['brands'][0].budget == 0){
                $("#data_not_available").show();
            }

            var brands_svg  = d3.select("#brands").append("svg")
                .attr("width", 400)
                .attr("height", 280)
                .attr("id",  "brands_svg")
                .append("g");

            var self = this ;

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
                    return ("brands_"+ d.id +"_circle" ) ;
                })
                .attr("stroke-width", '4')
                .attr("stroke" , blueOutline)
                .style("fill", darkblue)
                .attr("r" , function(d){
                    return d.r ;
                })
                .attr("cx" , function(d){
                    return d.cx ;})
                .attr("cy" , function(d){return d.cy ;});

            node.append("path")
                .attr("id", function(d){
                    return ("brands_"+ d.id +"_path" ) ;
                })
                .attr("d",function(d){
                    var dataSet = dataGenerator(d.cx, d.cy, d.r, d.percFill );
                    return lineFunction(dataSet);
                })
                .attr("stroke" , blue)
                .attr("stroke-width", 0.5)
                .attr("fill", blue);


//            node.append("title")
//                .text(function(d){
//                    return d.className ;});
//
//         node.append("title")
//                .text(function(d){
//                    return "Total spend : $" + d.spend ; });

            node.append("text") //For brand name
                .attr("transform", function(d) {
                    if(d.r > 40)
                        return "translate(" + d.cx + "," + (d.cy+35) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy+25) + ")";
                })
                .attr("font-family","Avenir")
                .style("font-weight","500")
                .style("z-index", "10")
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
                    if(d.r > 50){
                        text = d.className.substring(0, 6) + '...' ;
                    } else if (d.r > 40){
                        text = d.className.substring(0, 4) + '...' ;
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
                .style("z-index", "10")
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

            node.on("mouseover", function(obj){

                var focused_obj = {
                    name : obj.className,
                    id : obj.id,
                    cx : obj.cx,
                    cy : obj.cy,
                    percFill : obj.percFill,
                    spend : obj.spend,
                    r : obj.r
                };

        //        d3.select("#brands_"+focused_obj.id +"_path").remove();

                node.selectAll("circle").attr('opacity',0.5);
                node.selectAll("path").attr('opacity', 0.5);


          //     create new path element
                d3.select("#brands_"+focused_obj.id+ "_circle").attr('opacity', 1);
                d3.select("#brands_"+focused_obj.id+ "_path").attr('opacity', 1);

                d3.select("#brands_"+focused_obj.id+ "_path")
                    .attr('opacity', 1)
                    .attr("stroke" , darkBlueOutline)
                    .attr("stroke-width", 3)
                    .attr("fill", blue);

                return tooltip.text(focused_obj.name + ", Total Spend : $"+ focused_obj.spend.toFixed(0).replace(/./g, function(c, i, a) {
                    return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
                }) ).style("visibility", "visible");

            });

            node.on("mouseout" , function(obj){
                var focused_obj = {
                    name : obj.className,
                    id : obj.id,
                    cx : obj.cx,
                    cy : obj.cy,
                    percFill : obj.percFill,
                    r : obj.r
                };

                node.selectAll("circle").attr('opacity',1);
                node.selectAll("path").attr('opacity', 1);

                d3.select("#brands_"+focused_obj.id +"_path")
                    .attr('opacity', 1)
                    .attr("stroke" , blue)
                    .attr("stroke-width", 0.5)
                    .attr("fill", blue);

                return tooltip
                    .style("visibility", "hidden");

            });

           node.on("mousemove", function(){
               return tooltip.style("top", (event.pageY-10)+"px")
                   .style("left",(event.pageX+10)+"px");
           });

            node.on("click", function(obj) {

               var brand_name = obj.className ;
                
                $rootScope.$broadcast(constants.BUBBLE_BRAND_CLICKED, obj);

                $("#brands").hide();
                $("#backToBrands").show();


                var campaigns = obj.campaigns ;
                var data = {
                    "campaigns": campaigns
                };

               self.createBubbleChartForCampaigns("campaigns",data );

                $("#campaigns").show();
                self.first = false ;
            });

        } ;

        this.cleaningBubbleChart = function(spanId){
            d3.select("#"+spanId+"_svg").remove();
            $("#data_not_available").hide();
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
                    return ( "campaigns_"+d.id +"_circle" ) ;
                })
                .attr("stroke-width", '4')
                .attr("stroke" , function(d){
                    return (d.status == 'ontrack') ? greenOutline  : orangeOutline ;
                })
                .attr("fill",function(d){
                    return (d.status === 'ontrack') ? darkgreen : darkOrange ;
                })
                .attr("r" , function(d){
                    return d.r ;
                })
                .attr("cx" , function(d){return d.cx ;})
                .attr("cy" , function(d){return d.cy ;});

            node.append("path")
                .attr("id", function(d){
                    return ("campaigns_" + d.id +"_path" ) ;
                })
                .attr("d",function(d){
                    var dataSet = dataGenerator(d.cx, d.cy, d.r, d.percFill );
                    return lineFunction_circle(dataSet);
                })
                .attr("stroke-width",4)
                .attr("stroke" , function(d){
                    return (d.status == 'ontrack') ?  greenOutline : orangeOutline ;
                })
                .attr("fill",function(d) {
                 return (d.status == 'ontrack') ?  green : orange ;

                }) ;

//                    node.append("title")
//                        .text(function (d) {
//                            return d.className;
//                        });


            node.append("text") //For brand name
                .attr("transform", function(d) {
                    if(d.r > 40)
                        return "translate(" + d.cx + "," + (d.cy+35) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy+20) + ")";
                })
                .attr("font-family","Avenir")
                .style("z-index", "10")
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
                    if(d.r > 50){
                        text = d.className.substring(0, 6) + '...' ;
                    } else if(d.r > 40){
                        text = d.className.substring(0, 4) + '...' ;
                    }
                    else if (d.r > 25){
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
                .style("z-index", "10")
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

            node.on("mouseover", function(obj){

                var campaign_obj = {
                    name : obj.className,
                    id : obj.id,
                    cx : obj.cx,
                    cy : obj.cy,
                    status : obj.status,
                    percFill : obj.percFill,
                    spend : obj.spend,
                    r : obj.r
                };

                //        d3.select("#brands_"+focused_obj.id +"_path").remove();

                node.selectAll("circle").attr('opacity',0.4);
                node.selectAll("path").attr('opacity', 0.4);


                //     create new path element campaigns_0_circle
                d3.select("#campaigns_"+campaign_obj.id+ "_circle").attr('opacity', 1);
                d3.select("#campaigns_"+campaign_obj.id+ "_path").attr('opacity', 1);

                d3.select("#campaigns_"+campaign_obj.id+ "_path")
                    .attr("stroke" , (campaign_obj.status == 'ontrack')? darkGreenOutline : darkOrangeOutline)
                    .attr("fill", (campaign_obj.status == 'ontrack')? green : orange )
                    .attr("stroke-width", 3);

                return tooltip.text(campaign_obj.name +", Total Spend : $"+ campaign_obj.spend.toFixed(0).replace(/./g, function(c, i, a) {
                    return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
                }) ).style("visibility", "visible");

            });


            node.on("mousemove", function(){
                return tooltip.style("top", (event.pageY-10)+"px")
                    .style("left",(event.pageX+10)+"px");
            });

            node.on("mouseout" , function(obj){
                var campaign_obj = {
                    name : obj.className,
                    id : obj.id,
                    cx : obj.cx,
                    cy : obj.cy,
                    percFill : obj.percFill,
                    status : obj.status,
                    r : obj.r
                };

                node.selectAll("circle").attr('opacity',1);
                node.selectAll("path").attr('opacity', 1);

                d3.select("#campaigns_"+campaign_obj.id+ "_path")
                    .attr("stroke" , (campaign_obj.status == 'ontrack')? greenOutline : orangeOutline)
                    .attr("fill", (campaign_obj.status == 'ontrack')? green : orange )
                    .attr("stroke-width", 3);


                return tooltip
                    .style("visibility", "hidden");

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
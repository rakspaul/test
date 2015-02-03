(function() {
    "use strict";
    commonModule.service("bubbleChart", function() {

        var dark_blue = "#1B9FEC" ,
            blue = "#0978C9" ,
            orange = "#F67C29" ,
            darkOrange = "#DD6B1D",
            green ="#64EF3A",
            darkgreen = "#64D841",

            blueOutline = "#1378C3",
            greenOutline = "#64D841" ,
            orangeOutline = "#DB691C";

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

        var createChartContainer = function(spanId , w, h, b){
            var width = w, //400,
                height = h , //280,
                bleed =  b , //300,
                format = d3.format(",d"),
                color = d3.scale.category20c();


            var bubble = d3.layout.pack()
                //  .sort(null)
                .sort(function(a, b) { return -(a.value - b.value); })
                .size([width+ bleed*2, height])
                .padding(3);

            var svg = d3.select("#"+spanId).append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("id",  spanId+"_svg")
                .append("g");

//            var campaigns_svg = d3.select("#"+spanId).append("svg")
//                .attr("width", width)
//                .attr("height", height)
//                .attr("id",  "campaigns_svg")
//                .append("g");
            //  .attr("class", "bubble")
            // .attr("transform", "translate(" + -bleed + ",0)");

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

            var container = {
//                campaigns_svg :campaigns_svg,
//                brands_svg: brands_svg ,
                svg : svg,
                bubble : bubble,
                text : text,
                format : format
            };
            return container;

        } ;

        function dataFormatting (root , spanId){
            var positions = [[90,80],[250,100],[160,200],[60,210] ,[280,200],[[290,220]]];
           var positionsCampaigns =  [[90,80],[250,100],[175,200],[60,210] ,[280,200],[[290,220]]];
            var formattedDataBrands = [];
            var formattedDataCampaigns = [];
            if(spanId == 'brands'){
                var brandArray = root['brands'];
                var maxRadius = 75 ;
                var maxBudget = brandArray[0].budget ;
                var ratio = maxRadius / maxBudget ;
                for(var i in brandArray){
                    var node = brandArray[i];
                    var object = {
                        className: node.name,
                        value : node.budget,
                        budget :node.budget,
                        spend : node.spend,
                        percFill : Math.round((node.spend / node.budget)* 100) ,
                        campaigns : node.campaigns,
                        cx : positions[i][0],
                        cy : positions[i][1],
                        r : (node.budget)*ratio
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
                        className: node.name,
                        value : node.budget,
                        budget :node.budget,
                        spend : node.spend,
                        status : node.status,
                        percFill : Math.round((node.budget / node.spend , 2)* 100) ,
                        cx : positionsCampaigns[i][0],
                        cy : positionsCampaigns[i][1],
                        r : (node.budget)*ratio
                    };
                    formattedDataCampaigns.push(object);
                }

            }
            return {
                formattedDataBrands : formattedDataBrands,
                formattedDataCampaigns : formattedDataCampaigns
            } ;
        };

        function configureGrad( perc , id ,svg, lightcolor, darkcolor) {
//         console.log("configure grad is called ");
//            console.log(perc + id) ;

           // var spanId = (id === 'brandBlueGrad')? 'brands' : 'campaigns' ;

            var grad =  svg
                .append("defs")
                .append("linearGradient")
                .attr("id", id)
                .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%")
                .selectAll("stop")
                .data([
                    {offset: perc + "%" , color : lightcolor },
                    {offset : (100 -perc)+ "%" , color : darkcolor }
                ])
                .enter().append("stop")
                .attr("offset" , function(d) {
                    // console.log(d.offset);
                    return d.offset; } )
                .attr("stop-color" , function(d){
                    //console.log(d.color);
                    return d.color ;});

//            grad.append("stop").
//                attr("offset" , function(){
//                    var percentrage = perc + '%' ;
//                    console.log(percentrage);
//                    return percentrage ;
//                }).style("stop-color",dark_blue); // dark blue
//
//            grad.append("stop")
//                .attr("offset", function(){
//                    console.log((100 - perc) + "%");
//                    return (100 - perc) + "%";
//                }).style("stop-color",blue); // light blue
//
            return grad;

        };

        function updateBubbleChartData(data){
            this.spendData = data ;

             createBubbleChartNew.call(this, "brands", this.spendData);
        };

        this.updateBubbleChartData = updateBubbleChartData ;

        function createBubbleChartNew(spanId, data) {
            var self = this ;
            var bubbleContainer = createChartContainer(spanId,400, 280, 420 );

            var chartData =  dataFormatting(data,"brands")['formattedDataBrands'];

            var node = bubbleContainer.svg.selectAll(".node")
                .data(chartData)
                .enter()
                .append("g")
                .attr("class" , "node") ;

            node.append("circle")
                .attr("stroke-width", '4')
                .attr("stroke" , blueOutline)

                .style("fill", blue)
//                .style("fill", function() {
//                return "hsl(" + Math.random() * 360 + ",100%,50%)";
//            })

                //function(d){
//                    var brandBlueGrad = configureGrad(d.percFill,"brandBlueGrad",bubbleContainer.svg, blue, dark_blue);
//                    return "url(#brandBlueGrad)" ;
//                })
                .style('opacity', 1)
                .attr("r" , function(d){
                    return d.r ;
                })
                .attr("cx" , function(d){return d.cx ;})
                .attr("cy" , function(d){return d.cy ;});

            node.append("title")
                .text(function(d){
                    return d.className ;});

            node.append("text") //For brand name
                .attr("transform", function(d) {
                    if(d.r > 40)
                        return "translate(" + d.cx + "," + (d.cy+35) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy+20) + ")";
                })
                .attr("font-family","sans-serif")
               // .attr("dy", "30em")
                .style("font-size", function(d){
                    var size ;
                    if(d.r > 40 )
                    size = "18px"
                    else if (d.r > 25)
                    size = "16px"
                    return size ;
                })
                .style("text-anchor", "middle")
                .attr("fill", "white")
                .text(function(d) {
                    var text ;
                    if(d.r > 40){
                        text = d.className.substring(0, 4) + '...' ;
                    } else if (d.r > 25){
                        text = d.className.substring(0, 3) + '...' ;
                    }
                    return text ;
                }); // TODO : text auto resizing : http://bl.ocks.org/mbostock/1846692

            node.data(chartData).append("text") // for brand budget
                .attr("transform", function(d) {
                    if(d.r > 40)
                        return "translate(" + d.cx + "," + (d.cy+10) + ")";
                    else
                        return  "translate(" + d.cx + "," + (d.cy) + ")";
                })
                .attr("font-family","sans-serif")
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
                .attr("font-weight","bold")
                .attr("fill", "white")
                .style("text-anchor", "middle")
                .text(function(d) {
                    var budget ;
                    if(d.r >15)
                        budget = getRepString(d.budget);

                    return budget ;
                });


            node.on("click", function(d) {
                $("#brands").hide();
                $("#backToBrands").show();
                var campaing_svg_id = "campaigns_svg"

             //   $("#brands_svg").empty();
                console.log("cleared brands svg");

                var campaigns = d.campaigns ;
                var data = {
                    "campaigns": campaigns
                };
                console.log(data.campaigns);
                console.log("this.first is "+ self.first);

                self.createBubbleChartForCampaigns("campaigns",data );

                $("#campaigns").show();
                self.first = false ;
            });
        } ;

        this.cleaningBubbleChart = function(spanId){
            d3.select("#"+spanId+"_svg").remove();
        };

        this.createBubbleChartForCampaigns = function( spanId , data){
            var campaignChartContainer = createChartContainer(spanId , 400, 280, 420);

            var chartData =  dataFormatting(data,spanId)['formattedDataCampaigns'];

            var node = campaignChartContainer.svg.selectAll(".node")
                .data(chartData).enter()
                .append("g")
                .attr("class" , "node");

            node.append("circle")
                .attr("stroke-width", '4')
                .attr("stroke" , function(d){
                    if(d.status === 'ontrack') return greenOutline  ;
                    else if(d.status === 'underperforming') return orangeOutline;
                })
                .attr("fill",function(d){

                    if(d.status === 'ontrack') {
//                        var campaignGreenGrad = configureGrad(d.percFill,"campaignGreenGrad", campaignChartContainer.svg ,green, darkgreen);
//                        return "url(#campaignGreenGrad)" ;

                          return greenOutline  ;
                    }
                    else if(d.status === 'underperforming') {
//                        var campaignOrangeGrad = configureGrad(d.percFill,"campaignOrangeGrad",  campaignChartContainer.campaigns_svg,orange, darkOrange);
//                        return "url(#campaignOrangeGrad)" ;
                        return orangeOutline
                    }
                })
                .attr("r" , function(d){
                    return d.r ;
                })
                .attr("cx" , function(d){return d.cx ;})
                .attr("cy" , function(d){return d.cy ;});

            node.append("title")
                .text(function(d){
                    return d.className ;});

            node.append("text") // for brand budget
                .attr("transform", function(d) {
                    if(d.r > 25)
                    return "translate(" + d.cx + "," + (d.cy+10) + ")";
                    else
                    return  "translate(" + d.cx + "," + (d.cy+5) + ")";
                })
                .attr("font-family","sans-serif")
                .attr("font-size",function(d){
                    var text_size ;
                    if(d.r > 50){
                        text_size = "35px";
                    }else if(d.r > 40){
                        text_size="28px";
                    } else if(d.r >25) {
                        text_size="18px" ;
                    } else if(d.r > 15){
                        text_size = "14px"
                    }
                    return text_size ;
                })
                .attr("font-weight","bold")
                .attr("fill", "white")
                .style("text-anchor", "middle")
                .text(function(d) {
                    var budget ;
                    if(d.r >8)
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
define(['angularAMD'
],function (angularAMD) {
    'use strict';
    angObj.controller('HelpController', function ($scope, $sce) {

        $(".main_navigation").find(".each_nav_link").removeClass("active");
        $scope.help_domain_url = $sce.trustAsResourceUrl(window.help_domain_url);

       /*    $scope.helpLink = function() {
             $location.url("help");

          };

        var loc = window.location.toString(),
        params = loc.split('?')[1],
        params2 = loc.split('?')[1],
        params3 = loc.split('?')[1],
        params4 = loc.split('?')[1],
        params5 = loc.split('?')[1],
        params6 = loc.split('?')[1],
        params7 = loc.split('?')[1],
        params8 = loc.split('?')[1],
        params9 = loc.split('?')[1],
        params10 = loc.split('?')[1],

        iframe = $('#myiframe');

        console.log(params);

    if (params === 'platform') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/D_Reports/Explaining%20the%20Platform%20Report.htm%3FTocPath%3DVISTO%2520Reports|_____3');
    }

    if (params2 === 'performance') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/D_Reports/Explaining%20the%20Performance%20Report.htm%3FTocPath%3DVISTO%2520Reports|_____1');
    }

    if (params3 === 'dashboard') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/B_Dashboard/Explaining%20the%20Dashboard.htm%3FTocPath%3DDashboard|_____0');
    }

    if (params4 === 'campaigns') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/C_Campaigns/Explaining%20Campaigns.htm%3FTocPath%3DCampaigns|_____0');
    }

    if (params5 === 'cost') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/D_Reports/Explaining%20the%20Cost%20Report.htm%3FTocPath%3DVISTO%2520Reports|_____2');
    }

    if (params6 === 'inventory') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/D_Reports/Explaining%20the%20Inventory%20Report.htm%3FTocPath%3DVISTO%2520Reports|_____4');
    }

    if (params7 === 'quality') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/D_Reports/Explaining%20the%20Quality%20Report.htm%3FTocPath%3DVISTO%2520Reports|_____5');
    }

    if (params8 === 'optimization') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/D_Reports/Explaining%20the%20Optimization%20Impact%20Report.htm%3FTocPath%3DVISTO%2520Reports|_____6');
    }

    if (params9 === 'insights') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm#A_Visto/E_Collective%20Insights/Explaining%20Collective%20Insights%20Reports.htm%3FTocPath%3DCollective%2520Insights|_____0');
    }

    if (params10 === 'customreport') {
        $('#myiframe').attr('src','https://vistohelpqa.collective.com/Default.htm');
    }
             */


     });
});

(function () {
    'use strict';
    campaignModule.directive('campaignDropDown', ['utils', function (utils) {
        return {
            restrict: 'AE',
            scope: {
                selectedObj: "="
            },
            controller: 'campaignController',
            templateUrl: '/assets/html/campaign_drop_down.html',
            link: function ($scope, element, attrs) {

                console.log("Campaing directive initialize ");
                $('#campaigns_list').scrollWithInDiv();

                //Function called when the user clicks on the down arrow icon
                $('#campaign_arrow_img,#campaignDropdown').click(function ($event) {
                    if ($('#campaigns_list').css('display') === 'block')
                        $('#campaigns_list').hide();
                    else
                        $('#campaigns_list').show();
                    if($event.target.id === 'campaignDropdown')
                        $('#campaignDropdown').val('');
                });

                $(document).click(function(event) {
                    if(!$("#campaignDropdown").is(':focus')) {

                        $("#campaigns_list").hide();
                        $("#campaignDropdown").val($scope.$parent.selectedCampaign.name);

                        $(".campaign_name_length").text($("#campaignDropdown").attr("placeHolder")) ;
                        $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                    }
                });

                $(document).ready(function(){

                    $('#campaignDropdown').keydown(function() {
                        $(".campaign_name_length").text($(this).val()) ;
                        $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                    });
                    setTimeout(function(){
                        $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                    }, 100);
                    $(".campaigns_list_li").click( function() {
                        $(".campaign_name_length").text($(this).text()) ;
                        $("#campaignDropdown").width( $(".campaign_name_length").width() + 14  ) ;
                    });
                    $("#campaigns_list").click( function() {
                        $(".campaign_name_length").text($("#campaignDropdown").attr("placeHolder")) ;
                        $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                    });
                });

            }
        };
    }]);

}());

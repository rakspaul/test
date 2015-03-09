(function () {
    'use strict';
    angObj.directive('largeListSearch',['utils', function (utils,domainReports) {
        return {
            restrict: 'AE',
            scope: {
                selectedObj: "="
            },
            controller: 'directiveController',
            template: '' +
            '<div class="clearfix dropdown_type1_holder pull-left">' +
                '<span class="report_heading_dropdown_txt">Campaign</span>' +
                '<div class="pull-left dropdown dropdown_type1">' +
                 '<span class="dropdown_ul_text" data-toggle="dropdown">' +
                    '<ul class="nav navbar-nav">' +
                     '<li class="dropdown" >' +
                        '<div id="campaignsDropdownDiv" style="display:inline;">' +
                            '<input style="width: 600px;" class="dropdown-toggle inactive dd_txt" ng-model="selectedObj.name" id="campaignDropdown" title="{{selectedObj.name}}" placeholder="{{selectedObj.name }}"  ng-keyup="search()"/>' +
                            '<span class="sort-image-inactive" id="#campaignsDropdownDiv"></span>' +
                            '<span class="campaign_name_length">{{selectedObj.name}}</span>' +
                         '</div>' +
                         '<ul class="dropdown-menu" role="menu"  id="campaigns_list" lr-infinite-scroll="loadMore" scroll-threshold="200" list-exhausted="{{exhausted}}" fetching="{{fetching}}">' +
                             '<li ng-repeat="campaign in campaigns" class="campaigns_list_li" value="{{campaign.campaign_id}}" _kpi="{{campaign.kpi_type}}" title="{{campaign.name}}" >{{campaign.name }}</li>' +
                         '</ul>' +
                       '</li>' +
                    '</ul>' +
                    '<span id="campaign_arrow_img" class="arrrow_img"></span>' +
                '</span></div></div><!-- dropdown_type1_holder -->',
            link: function (scope, element, attrs) {

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
                    $("#campaignDropdown").val(scope.$parent.selectedCampaign.name);

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
        }
    }]);
}());

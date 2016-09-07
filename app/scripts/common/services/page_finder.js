define(['angularAMD'],
    function (angularAMD) {

        angularAMD.factory('pageFinder', ['$location', function ($location) {

            var pageFinder = function(path) {
                var pageName;
                if (path.endsWith('dashboard')) {
                    pageName = 'dashboard';
                } else if (path.endsWith('mediaplans')) {
                    pageName = 'mediaplans';
                } else if (path.endsWith('/creative/list')) {
                    pageName = 'creativeList';
                } else if (path.endsWith('/reports/schedules')) {
                    pageName = 'customReportsList';
                } else if (path.indexOf('/customreport') > 0) {
                    pageName = 'customReports';
                } else if (path.endsWith('/reports/list')) {
                    pageName = 'uploadedReportsList';
                } else if (path.endsWith('/reports/upload')) {
                    pageName = 'uploadReports';
                } else if (path.split('/').indexOf('mediaplans') > 0) {
                    pageName = 'cannedReports';
                } else if (path.endsWith('invoices')) {
                    pageName = 'invoices';
                } else if (path.includes('/admin')){
                    pageName = 'admin';
                }

                return {
                    isDashboardPage: function() {
                        return pageName === 'dashboard';
                    },
                    isMediaplansPage: function() {
                        return pageName === 'mediaplans';
                    },
                    isCreativeListPage: function () {
                        return pageName === 'creativeList';
                    },
                    isCannedReportsPage: function() {
                        return pageName === 'cannedReports';
                    },
                    isCustomReportsPage: function() {
                        return pageName === 'customReports';
                    },
                    isCustomReportsListPage: function() {
                        return pageName === 'customReportsList';
                    },
                    isUploadReportsPage: function() {
                        return pageName === 'uploadReports';
                    },
                    isUploadedReportsListPage: function() {
                        return pageName === 'uploadedReportsList';
                    },
                    isInoviceListPage: function() {
                        return pageName === 'invoices';
                    },
                    isAdminPage: function(){
                        return pageName === 'admin';
                    },

                    /*
                     Use this method on change of account, subaccount, advertiser and brand only.
                     */
                    buildPage: function(url) {
                        if (this.isDashboardPage()) {
                            url += '/dashboard';
                        } else if (this.isMediaplansPage()) {
                            url += '/mediaplans';
                        } else if (this.isCannedReportsPage()) {
                            var reportName = _.last($location.path().split('/'));
                            url += '/mediaplans/reports/' + reportName;
                        } else if (this.isUploadReportsPage()) {
                            url += '/reports/upload';
                        } else if (this.isUploadedReportsListPage()) {
                            url += '/reports/list';
                        } else if (this.isCustomReportsPage()) {
                            url += '/customreport';
                        } else if (this.isCustomReportsListPage()) {
                            url += '/reports/schedules';
                        } else if (this.isCreativeListPage()){
                            url += '/creative/list';
                        } else if(this.isInoviceListPage()) {
                            url += '/v1sto/invoices';
                        } else if(this.isAdminPage()){
                            url += '/admin/accounts';
                        }
                        console.log('url', url);
                        return url;
                    },
                    pageName: function() {
                        return pageName;
                    }
                };
            };

            return {
                pageBuilder: pageFinder
            };
        }]);
    });

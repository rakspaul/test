define(['angularAMD'],
    function (angularAMD) {
        angularAMD.factory('pageFinder', function ($location) {
        var pageFinder = function(path) {
            var pageName;
            if (path.endsWith('dashboard')) {
                pageName = 'dashboard';
            } else if (path.endsWith('mediaplans')) {
                pageName = 'mediaplans';
            } else if (path.endsWith('/reports/list')) {
                pageName = 'uploadedReportsList';
            } else if (path.endsWith('/reports/upload')) {
                pageName = 'uploadReports';
            } else if (path.split('/').indexOf('mediaplans') > 0) {
                pageName = 'cannedReports';
            }

            return {
                isDashboardPage: function() {
                    return pageName == 'dashboard';
                },
                isMediaplansPage: function() {
                    return pageName == 'mediaplans';
                },
                isCannedReportsPage: function() {
                    return pageName == 'cannedReports';
                },
                isUploadReportsPage: function() {
                    return pageName == 'uploadReports';  
                },
                isUploadedReportsListPage: function() {
                    return pageName == 'uploadedReportsList';
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
    });
});

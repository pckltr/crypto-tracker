(function() {
    angular
        .module('CryptoApp', [])
        .controller('CryptoController', CryptoController);

    function CryptoController($scope, $http) {
        $scope.getClass = getClass;
        $scope.isLoaded = false;

        var myCryptoList = [
            { slug: 'bitcoin', quantity: 2, bought_price: 100 },
            { slug: 'litecoin', quantity: 10, bought_price: 1000 }
        ];

        var overview = {
            total: 0,
            total_invested: 0,
            profit: 0,
            profit_percent: 0
        };

        function init() {
            getCryptos();
        }

        function getClass(value) {
            var styleClass = '';

            if (value < 0) {
                styleClass = 'down';
            } else if (value > 50) {
                styleClass = 'upup';
            } else {
                styleClass = 'up';
            }

            return styleClass;
        }

        function getCryptos() {
            $http
                .get('https://api.coinmarketcap.com/v2/listings/')
                .then(matchMyCryptos, errorCallback)
                .then(getCryptoInfo, errorCallback);
        }

        function matchMyCryptos(obj) {
            angular.forEach(myCryptoList, function(myItem) {
                angular.forEach(obj.data.data, function(cmcItem) {
                    if (cmcItem.website_slug === myItem.slug) {
                        myItem.id = cmcItem.id;
                    }
                });
            })
        }

        function getCryptoInfo() {
            $http
                .get('https://api.coinmarketcap.com/v2/ticker/')
                .then(addToMyCrypto, errorCallback)
                .then(prepareOverviewInfo, errorCallback)
                .then(prepareForInterface, errorCallback);
        }

        function addToMyCrypto(obj) {
            angular.forEach(myCryptoList, function(myItem) {
                angular.forEach(obj.data.data, function(cmcItem) {
                    if (cmcItem.id === myItem.id) {
                        myItem.name = cmcItem.name;
                        myItem.symbol = cmcItem.symbol;
                        myItem.price = cmcItem.quotes.USD.price;
                        myItem.percent_change_1h = cmcItem.quotes.USD.percent_change_1h;
                        myItem.percent_change_24h = cmcItem.quotes.USD.percent_change_24h;
                        myItem.percent_change_7d = cmcItem.quotes.USD.percent_change_7d;
                        myItem.total = myItem.quantity * cmcItem.quotes.USD.price;
                        myItem.total_invested = parseInt(myItem.quantity * myItem.bought_price);
                        myItem.profit = parseInt(myItem.total - myItem.total_invested);
                        myItem.profit_percent = parseInt(((myItem.total - myItem.total_invested) * 100) / myItem.total_invested);
                    }
                });
            })
        }

        function prepareOverviewInfo() {
            angular.forEach(myCryptoList, function(myItem) {
                overview.total += myItem.total;
                overview.total_invested += myItem.total_invested;
            });
            overview.profit = overview.total - overview.total_invested;
            overview.profit_percent = (overview.profit * 100) / overview.total_invested;
        }

        function prepareForInterface() {
            $scope.myCryptoList = myCryptoList;
            $scope.overview = overview;
            $scope.isLoaded = true;
        }

        function errorCallback(err) {
            console.log(err);
        }

        init();
    }
})();
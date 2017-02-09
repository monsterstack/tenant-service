(function(angular){
    angular
        .module("dsp.components.tenant.search", ['ngMaterial','ngSanitize', 'dataGrid','pagination', 'ui.select'])
        .component("dspServicesSearch", {
            controller: dspTenantSearchController,
            controllerAs: "vm",
            templateUrl:"/portal/components/tenant.search/tenant.search.html"
        });

    function dspTenantSearchController($scope, $http, $window, $mdDialog, socket){
        let vm = this;
        let listeners = {};

        vm.$onInit = initialize($http);

        vm.display = {};

        vm.display.searchCriteria = "";
        vm.display.searchResults = [];
        vm.display.searchSubmitted = false;

        vm.display.pagination = {};
        vm.display.pagination.oneIndexedPage = 1;
        vm.display.pagination.size = 20;
        vm.display.pagination.total = 0;

        vm.display.selectedStage = "";
        vm.display.stages = [];
        vm.display.selectedRegion = "";
        vm.display.regions = [];
        vm.display.selectedStatus = "";
        vm.display.statuses = [
            "Online",
            "Offline"
        ];
        vm.display.serviceTypes = [];

        vm.events = {};
        vm.events.onSearchCriteriaChange = onSearchCriteriaChange;
        vm.events.onSearch = onSearch;
        vm.events.onFilterChange = onFilterChange;
        vm.events.onPageChange = onPageChange;
        vm.events.onItemPerPageChange = onItemPerPageChange;
        vm.events.showApiSecret = showApiSecret;
        // vm.events.onDocClick = onDocClick;
        // vm.events.refreshServiceTypes = refreshServiceTypes;



        function initialize($http){
            // const REFRESH_EVENT = "refresh_event";
            let opt = {
                search: "",
                page: 0,
                size: 10
            }
            // getConstantsForFiltering();
            // getServiceTypes();

            // socket.on(REFRESH_EVENT,function(res){
            //     console.log("service changed, serviceId:", res);
            //     vm.display.searchSubmitted = false;
            // });

            search(opt, $http);
        }

        function onSearchCriteriaChange() {
            vm.display.searchSubmitted = false;
        }

        function prepareSearch(customizedOpt){
            let opt = {
                search: customizedOpt.search,
                page: customizedOpt.page,
                size: customizedOpt.size
            }
            search(opt, $http);
        }

        function onSearch(){
            console.log("!!!!!!",vm.display.searchCriteria)
            let opt = {
                search: vm.display.searchCriteria,
                page: 0,
                size: vm.display.pagination.size
            }
            prepareSearch(opt);
        }

        function onFilterChange(){
            let opt = {
                search: vm.display.searchCriteria,
                page: 0,
                size: vm.display.pagination.size
            }
            prepareSearch(opt);
        }

        function onPageChange(){
            let opt = {
                search: vm.display.searchCriteria,
                page: vm.display.pagination.oneIndexedPage - 1,
                size: vm.display.pagination.size
            }
            prepareSearch(opt);
        }

        function onItemPerPageChange(){
            let opt = {
                search: vm.display.searchCriteria,
                page: 0,
                size: vm.display.pagination.size
            }
            prepareSearch(opt);
        }

        function showApiSecret(apiKey, apiSecret){
            $mdDialog.show(
                $mdDialog.alert()
                .ok('Close')
                .clickOutsideToClose(true)
                .title('API Secret for API Key: ' + apiKey)
                .htmlContent('<div class="apiSecretText">' + apiSecret + '</div>')

            );
        }
        // function onDocClick(url){
        //     $window.open("https://www.google.com");
        // }

        // function refreshServiceTypes(){
        //     getServiceTypes();
        // }

        // function getConstantsForFiltering(){
        //     $http.get("/constants",{
        //         headers:{
        //             "Content-Type": "application/json"
        //         }
        //     }).then(
        //         function successCallback(results) {
        //             vm.display.stages = results.data.stageTypes;
        //             vm.display.regions = results.data.regionTypes;
        //         },
        //         function errorCallback(error) {
        //             console.log("error: ", error);
        //         }
        //     );
        // }

        // function getServiceTypes(){
        //     $http.get("/api/v1/services/_types",{
        //         headers:{
        //             "Content-Type": "application/json"
        //         }
        //     }).then(
        //         function successCallback(results) {
        //             let typeObjArr = results.data;
        //             vm.display.serviceTypes = [];
        //             for (let i=0; i<typeObjArr.length; i++) {
        //                 vm.display.serviceTypes.push(typeObjArr[i].type);
        //             }
        //         },
        //         function errorCallback(error) {
        //             console.log("error: ", error);
        //         }
        //     );
        // }


        function search(opt, $http){
            console.log("searched:::::::");
            let url = '/api/v1/tenants?search=' + opt.search
                    +'&page=' + opt.page + '&size=' + opt.size;
            console.log(url);
            $http.get(url,
            {
                headers:{
                    "Content-Type": "application/json",
                    "x-fast-pass": true
                }
            }).then(
                function successCallback(results) {
                    vm.display.searchResults = results.data.elements;

                    vm.display.pagination.oneIndexedPage = parseInt(results.data.page.page) + 1;
                    vm.display.pagination.size = parseInt(results.data.page.size);
                    vm.display.pagination.total = parseInt(results.data.page.total);

                    vm.display.searchSubmitted = true;


                    console.log("vm.display.searchResults: ", vm.display.searchResults);
                    console.log("vm.display.pagination: ", vm.display.pagination);

                },
                function errorCallback(error) {
                    let emptyArr = [];
                    vm.display.searchResults = emptyArr;
                    console.log("error: ", error);
                }
            );
        }

        function uptimeCal(timestampArr){

        }

    }
})(angular);


'use strict';

/**
 * @ngdoc function
 * @name yeomanApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the yeomanApp
 */
angular.module('yeomanApp')
    .controller('MainCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $scope.mode = 'query';
        $scope.determinateValue = 30;
        $scope.determinateValue2 = 30;
        /*$interval(function () {
         $scope.determinateValue += 1;
         $scope.determinateValue2 += 1.5;
         if ($scope.determinateValue > 100) {
         $scope.determinateValue = 30;
         $scope.determinateValue2 = 30;
         }
         }, 100, 0, true);
         $interval(function () {
         $scope.mode = ($scope.mode == 'query' ? 'determinate' : 'query');
         }, 7200, 0, true);*/


        $scope.alert = '';
        $scope.showAlert = function (ev) {
            $mdDialog.show(
                $mdDialog.alert()
                    .title('This is an alert title')
                    .content('You can specify some description text in here.')
                    .ariaLabel('Password notification')
                    .ok('Got it!')
                    .targetEvent(ev)
            );
        };
        $scope.showConfirm = function (ev) {
            var confirm = $mdDialog.confirm()
                .title('Would you like to delete your debt?')
                .content('All of the banks have agreed to forgive you your debts.')
                .ariaLabel('Lucky day')
                .ok('Please do it!')
                .cancel('Sounds like a scam')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function () {
                $scope.alert = 'You decided to get rid of your debt.';
            }, function () {
                $scope.alert = 'You decided to keep your debt.';
            });
        };

    }]);

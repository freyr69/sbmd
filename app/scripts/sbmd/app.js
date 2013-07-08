'use strict';

var app = angular.module("app", ['webcam']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'app/scripts/sbmd/views/main.html',
        controller: 'MainController'
    });

    $routeProvider.otherwise({redirectTo: '/'});
});
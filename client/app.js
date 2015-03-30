//ANGULARJS
(function(){
	'use strict';

	//define app
	var app = angular.module('Hungr', [], function config($httpProvider) {
		//$httpProvider.interceptors.push('AuthInteceptor');
	});

	//constants
	app.constant('API_URL', 'http://localhost:3000');
	app.constant('AppName', 'Hungr');


	//Controllers
	app.controller('MainCtrl', function MainCtrl(AppName){
		'use strict';
		var vm = this;
		vm.AppName = AppName;

	});






})();

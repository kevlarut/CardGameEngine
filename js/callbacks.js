var gameApp = angular.module('gameApp');

gameApp.service('callbacks', function(deck) {
	
	this.clickCardCallback = null;
	this.clickPlayerCallback = null;
	
});
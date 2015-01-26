var gameApp = angular.module('gameApp');

gameApp.service('callbacks', function() {
	
	this.clickCardCallback = null;
	this.clickPlayerCallback = null;
	this.textInputCallback = null;
	
});
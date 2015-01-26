var gameApp = angular.module('gameApp');

gameApp.service('userInterface', function(callbacks) {
	
	this.instructions = null;
	this.shouldShowTextInput = false;
	
});
var gameApp = angular.module('gameApp');

gameApp.service('inputService', function(callbacks) {
	
	this.textInput = null;
	
	this.handleTextInput = function(attackService) {
		if (callbacks.textInputCallback) {
			callbacks.textInputCallback(this.textInput, attackService);
			this.textInput = null;
		}
	}
	
});
var gameApp = angular.module('gameApp');

gameApp.service('inputService', function(callbacks) {
	
	this.textInput = null;
	
	this.handleTextInput = function(attackService) {
	
		var callback = callbacks.getCallback('textInput');
	
		if (callback) {
			callback.func(this.textInput, attackService);
			callback.clearCallback('textInput');
			this.textInput = null;
		}
	}
	
});
var gameApp = angular.module('gameApp');

gameApp.service('callbacks', function() {
	
	this.clickCardCallback = null;
	this.clickPlayerCallback = null;
	this.textInputCallback = null;
	
	var self = this;
		
	this.clearCallbacks = function() {	
		self.clickCardCallback = null;
		self.clickPlayerCallback = null;
		self.textInputCallback = null;
	}
});
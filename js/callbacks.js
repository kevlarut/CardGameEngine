var gameApp = angular.module('gameApp');

gameApp.service('callbacks', function() {
	
	var clickCardCallback = null;
	var clickPlayerCallback = null;
	var textInputCallback = null;
	
	var self = this;

	this.getCallback = function(event) {
		switch (event) {
			case 'clickCard':
				return clickCardCallback;
				break;
			case 'clickPlayer':
				return clickPlayerCallback;
				break;
			case 'textInput':
				return textInputCallback;
				break;
			default:
				console.log('ERROR: event type ' + event + ' is not defined.');
				return null;
				break;
		}
	}
	
	this.getInstructions = function() {
		var instructions = '';
		if (clickCardCallback) {
			instructions += 'Click card: ' + clickCardCallback.instructions;
		}
		if (clickPlayerCallback) {
			instructions += 'Click player: ' + clickPlayerCallback.instructions;
		}
		if (textInputCallback) {
			instructions += 'Text input: ' + textInputCallback.instructions;
		}
		return instructions;
	}
	
	this.setCallback = function(event, func, instructions) {
	
		var callback = {
			func: func,
			instructions: instructions
		};
	
		switch (event) {
			case 'clickCard':
				clickCardCallback = callback;
				break;
			case 'clickPlayer':
				clickPlayerCallback = callback;
				break;
			case 'textInput':
				textInputCallback = callback;
				break;
			default:
				log('ERROR: event type ' + event + ' is not defined.');
				break;
		}
	}
	
	
	this.clearCallback = function(event) {
	
		switch (event) {
			case 'clickCard':
				clickCardCallback = null;
				break;
			case 'clickPlayer':
				clickPlayerCallback = null;
				break;
			case 'textInput':
				textInputCallback = null;
				break;
			default:
				log('ERROR: event type ' + event + ' is not defined.');
				break;
		}
	}
	
	this.clearCallbacks = function() {	
		self.clickCardCallback = null;
		self.clickPlayerCallback = null;
		self.textInputCallback = null;
	}
});
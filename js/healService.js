var gameApp = angular.module('gameApp');

gameApp.service('healService', function(userInterface) {

	this.heal = function(magnitude, player) {
		player.hitPoints += magnitude;
		userInterface.instructions = null;
	}
});
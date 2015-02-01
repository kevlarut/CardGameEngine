var gameApp = angular.module('gameApp');

gameApp.service('healService', function(userInterface) {

	this.heal = function(magnitude, player, modifierCard) {
		if (modifierCard && modifierCard.effect == 'multiply') {
			magnitude *= modifierCard.magnitude;
		}
	
		player.hitPoints += magnitude;
		userInterface.instructions = null;
	}
});
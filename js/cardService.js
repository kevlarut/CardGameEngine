var gameApp = angular.module('gameApp');

gameApp.service('cardService', function(playerService) {

	this.canClickCard = function(card) {		
		var activePlayerId = playerService.getActivePlayerId();
		if (card.playerId != activePlayerId) {
			return false;
		}
		if (card.effects || card.modifierEffects || card.equippable) {
			return true;
		}
		
		return false;
	}
	
});
var gameApp = angular.module('gameApp');

gameApp.service('attackService', function(callbacks, cardService, deckService, gameService, playerService, userInterface) {
			
	var self = this;
			
	this.endAttack = function(card) {
		deckService.discard(card);
		gameService.activeCard = null;
		userInterface.instructions = null;
	}
		
	this.playAllApplicableTrapCards = function(defender, attacker) {	
		var applicableTrapCards = defender.equippedCards.filter(function(card) {
			return card.type === 'trap';
		});
		applicableTrapCards.forEach(function(card) {
			switch (card.effect) {
				case 'damage':
					gameService.damagePlayer(attacker, card.magnitude);
					break;
				default:
					console.log('ERROR: Effect type "' + card.effect + '" is not implemented for trap cards.');
					break;
			}
			
			playerService.discardSpecificEquippedCard(defender, card);
		});
	}
	
});
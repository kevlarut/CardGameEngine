var gameApp = angular.module('gameApp');

gameApp.service('reactionService', function(cardService, deckService) {

	this.spendCardToBlockAttackIfPossible = function(target) {
	
		var blocked = false;
		var deflected = false;
	
		for (var i = 0; i < target.equippedCards.length; i++) {
			var card = target.equippedCards[0];
			if (card.effect == 'vulnerability') {
				return {
					blocked: false,
					deflected: false
				};
			}
		}
	
		for (var i = 0; i < target.equippedCards.length; i++) {
			var card = target.equippedCards[0];
			if (cardService.doesCardContainEffect(card, 'deflect')) {
			
				if (card.type == 'trap') {
					deckService.discard(card);
					target.equippedCards.splice(i, 1);
				}
				
				deflected = true;
				blocked = true;
				break;
			}
		}
		
		for (var i = 0; i < target.equippedCards.length; i++) {
			var card = target.equippedCards[0];
			if (card.effect == 'block' || cardService.doesCardContainEffect(card, 'block')) {
			
				if (card.type == 'trap') {
					deckService.discard(card);
					target.equippedCards.splice(i, 1);
				}
					
				blocked = true;
				break;
			}
		}
	
		if (!blocked) {
			for (var i = 0; i < target.hand.length; i++) {				
				var card = target.hand[i];
				if (card.type == 'defend' || card.type == 'block' || (card.type != 'trap' && cardService.doesCardContainEffect(card, 'block'))) {
					deckService.discard(card);
					target.hand.splice(i, 1);
					blocked = true;
					break;
				}
			}
		}
		
		var result = {
			blocked: blocked,
			deflected: deflected
		};
		return result;
	}
	
});
var gameApp = angular.module('gameApp');

gameApp.service('attackService', function(deck) {
	
	this.spendCardToBlockAttackIfPossible = function(target) {
	
		var blocked = false;
	
		for (var i = 0; i < target.equippedCards.length; i++) {
			var card = target.equippedCards[0];
			if (card.effect == 'block') {
				blocked = true;
				break;
			}
		}
	
		if (!blocked) {
			for (var i = 0; i < target.hand.length; i++) {				
				if ((target.hand[i].type == 'defend' || target.hand[i].type == 'block')) {
					deck.discard(target.hand[i]);
					target.hand.splice(i, 1);
					blocked = true;
					break;
				}
			}
		}
		
		return blocked;
	}
	
});
var gameApp = angular.module('gameApp');

gameApp.service('drawService', function(deckService) {
	
	this.draw = function(player, deckId, numberOfCardsToDraw) {
		
		if (numberOfCardsToDraw > 0) {
			var cards = deckService.draw(deckId, numberOfCardsToDraw);
			cards.forEach(function(card) {
				card.playerId = player.id;
			});
			player.hand = player.hand.concat(cards);		
		}
	}	
	
});
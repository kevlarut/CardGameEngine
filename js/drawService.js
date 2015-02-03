var gameApp = angular.module('gameApp');

gameApp.service('drawService', function(callbacks, playerService) {
	
	this.draw = function(player, deckId, numberOfCardsToDraw) {
		
		if (numberOfCardsToDraw > 0) {
			playerService.draw(player, deckId, numberOfCardsToDraw);			
		}
	}	
	
});
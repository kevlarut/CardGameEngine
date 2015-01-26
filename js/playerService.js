var gameApp = angular.module('gameApp');

gameApp.service('playerService', function(deckService, playerData) {
		
	this.discardAllCardsInHand = function(player) {
		var card = player.hand.pop();
		while (card) {
			deckService.discard(card);
			card = player.hand.pop();
		}
	}
	
	this.discardAllEquippedCards = function(player) {
		var card = player.equippedCards.pop();
		while (card) {
			deckService.discard(card);
			card = player.equippedCards.pop();
		}
	}
	
	this.isThisTheActivePlayer = function(player) {
		return player == playerData.players[0];
	}

	this.loadPlayers = function(game) {
	
		var names = ['Johnny Come Lately', 'Marathon Mary', 'Tenacious Terry', 'Edna Endurance', 'Lackadaisical Lacie', 'Brisk Brittany', 'Hurried Harry'];
		var players = [];
		for (var i = 1; i <= playerData.numberOfPlayers; i++) {
			var player = {};
			player.equippedCards = [];
			player.hitPoints = game.initialHitPoints;
			player.name = names[i-1];
			player.victoryPoints = 0;
			players.push(player);
		}
		
		return players;
	}
});
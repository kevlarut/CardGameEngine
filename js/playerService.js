var gameApp = angular.module('gameApp');

gameApp.service('playerService', function(deck, playerData) {
		
	this.discardAllCardsInHand = function(player) {
		var card = player.hand.pop();
		while (card) {
			deck.discard(card);
			card = player.hand.pop();
		}
	}
	
	this.discardAllEquippedCards = function(player) {
		var card = player.equippedCards.pop();
		while (card) {
			deck.discard(card);
			card = player.equippedCards.pop();
		}
	}

	this.loadPlayers = function() {
	
		var names = ['Marathon Mary', 'Johnny Come Lately', 'Edna Endurance', 'Tenacious Terry', 'Lackadaisical Lacie', 'Brisk Brittany', 'Hurried Harry'];
		var players = [];
		for (var i = 1; i <= playerData.numberOfPlayers; i++) {
			var player = {};
			player.equippedCards = [];
			player.hand = deck.draw(5);
			player.hitPoints = 5;
			player.name = names[i-1];
			players.push(player);
		}
		
		return players;
	}
});
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
	
	this.discardSpecificEquippedCard = function(player, card) {	
		var index = player.equippedCards.indexOf(card);
		player.equippedCards.splice(index, 1);
	}
	
	this.getActivePlayerId = function() {
		return playerData.players[0].id;
	}
	
	this.getTargetablePlayers = function() {
		var players = [];
		for (var i = 1; i < playerData.players.length; i++) {
			if (!playerData.players[i].isDead) {
				players.push(playerData.players[i]);
			}
		}
		return players;
	}
	
	this.getPlayerById = function(id) {
		for (var i = 0; i < playerData.players.length; i++) {
			if (playerData.players[i].id == id) {
				return playerData.players[i];
			}
		}
		return null;
	}
	
	this.isThisTheActivePlayer = function(player) {
		return player == playerData.players[0];
	}

	this.loadPlayers = function(game) {
	
		var names = game.playerNames || ['Johnny Come Lately', 'Marathon Mary', 'Tenacious Terry', 'Edna Endurance', 'Lackadaisical Lacie', 'Brisk Brittany', 'Hurried Harry'];
				
		var players = [];
		for (var i = 0; i < playerData.numberOfPlayers; i++) {
			var player = {};
			player.equippedCards = [];
			player.hand = [];
			player.hitPoints = game.initialHitPoints;
			player.id = i;
			player.name = names[i];
			player.victoryPoints = 0;
			players.push(player);
		}
		
		return players;
	}
});
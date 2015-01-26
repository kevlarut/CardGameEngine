var gameApp = angular.module('gameApp');

gameApp.service('gameService', function(deck, gameData, playerData, playerService, userInterface) {
	
	this.actions = 0;
	this.activeCard = null;
	this.mana = 0;
	this.handLimit = 8;	
	
	this.damagePlayer = function(player, damage, modifierCard) {
	
		if (modifierCard && modifierCard.effect == 'multiply') {
			damage *= modifierCard.magnitude;
		}
	
		player.hitPoints -= damage;
		if (player.hitPoints <= 0) {
			console.log('Player ' + player.name + ' has ' + player.hitPoints + ' hit points.  This player is now dead.');
			this.killPlayer(player);			
		}
	}	
	
	this.killPlayer = function(player) {
		player.isDead = true;
		playerService.discardAllCardsInHand(player);
		playerService.discardAllEquippedCards(player);
		
		var alivePlayers = 0;
		var alivePlayerName = 'Nobody';
		for (var i = 0; i < playerData.players.length; i++) {
			if (!playerData.players[i].isDead) {
				alivePlayers++;
				alivePlayerName = playerData.players[i].name;
			}
		}
		
		if (alivePlayers < 2) {
			alert('Game over! ' + alivePlayerName + ' wins.');
			this.startNewGame();
		}
		else if (player == playerData.players[0]) {
			this.nextTurn();
		}
	}
	
	this.endTurn = function() {
	
		var player = playerData.players[0];
	
		if (player.hand.length > this.handLimit) {
			userInterface.instructions = 'You must discard down to ' + this.handLimit + ' cards.  Click on a card to use or discard it.';
			return false;
		}
		
		var repulsedCardsInHand = [];
		for (var i = 0; i < player.hand.length; i++) {
			var card = player.hand[i];
			if (card.repulsed) {
				repulsedCardsInHand.push(card);
			}
		}
		if (repulsedCardsInHand.length > 0) {
			for (var i = 0; i < player.hand.length; i++) {
				var card = player.hand[i];
				for (var j = 0; j < repulsedCardsInHand.length; j++) {				
					if (card.title == repulsedCardsInHand[j].repulsed) {
						userInterface.instructions = 'Since you have "' + card.title + '" in your hand, you must discard "' + repulsedCardsInHand[j].title + '"';
						return false;
					}
				}
			}
		}
		
		do {
			var previousPlayer = playerData.players[0];
			playerData.players.splice(0, 1);
			playerData.players.push(previousPlayer);
		} while (playerData.players[0].isDead);	
		
		return true;
	}
	
	this.beginNewTurn = function() {
	
		userInterface.instructions = null;
	
		var player = playerData.players[0];
		player.hand = player.hand.concat(deck.draw(2));
		this.actions = 2;
		this.mana = 0;
		
		for (var i = 0; i < player.equippedCards.length; i++) {
			var card = player.equippedCards[0];
			if (isNaN(card.expendedDuration)) {
				card.expendedDuration = 0;
			}
			card.expendedDuration++;
			console.log('expended: ' + card.expendedDuration + '; duration = ' + card.duration);
			if (card.expendedDuration >= card.duration) {
				deck.discard(card);
				player.equippedCards.splice(i, 1);
				i--;
			}
		}
	}
	
	this.nextTurn = function() {
	
		if (!this.endTurn()) {
			return;
		}
		
		this.beginNewTurn();
	}
	
	this.recycleHand = function() {
		playerService.discardAllCardsInHand(playerData.players[0]);
		playerData.players[0].hand = deck.draw(5);
		this.nextTurn();
	}
	
	this.startNewGame = function() {	
		
		//var game = gameData['generic'];	
		var game = gameData['mudslinger'];	
		
		deck.loadCards(game.decks[0]);		
		deck.shuffle();	
		playerData.players = playerService.loadPlayers();
		this.beginNewTurn();
	}
	
});
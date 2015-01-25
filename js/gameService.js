var gameApp = angular.module('gameApp');

gameApp.service('gameService', function(deck, playerData, playerService, userInterface) {
	
	this.actions = 0;
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
	
	this.nextTurn = function() {
	
		if (playerData.players[0].hand.length > this.handLimit) {
			userInterface.instructions ='You must discard down to ' + this.handLimit + ' cards.  Click on a card to use or discard it.';
			return;
		}
	
		do {
			var previousPlayer = playerData.players[0];
			playerData.players.splice(0, 1);
			playerData.players.push(previousPlayer);
		} while (playerData.players[0].isDead);		
		
		var player = playerData.players[0];
		player.hand = player.hand.concat(deck.draw(2));
		this.actions = 2;
		
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
	
	this.recycleHand = function() {
		playerService.discardAllCardsInHand(playerData.players[0]);
		playerData.players[0].hand = deck.draw(5);
		this.nextTurn();
	}
	
	this.startNewGame = function() {
		deck.loadCards();
		deck.shuffle();	
		playerData.players = playerService.loadPlayers();
		this.nextTurn();
	}
	
});
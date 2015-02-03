var gameApp = angular.module('gameApp');

gameApp.service('gameService', function(deckRepository, deckService, gameData, playerData, playerService, userInterface) {
	
	this.actions = 0;
	this.game = null;
	this.mana = 0;
	this.handLimit = 8;	
	
	this.areManaRequirementsMet = function(card) {
		if (card.cost) {
			return this.mana >= card.cost;
		}
		else {
			return true;
		}
	}
	
	this.getGameNames = function() {
		var names = [];
		for (var i = 0; i < gameData.games.length; i++) {
			names.push(gameData.games[i].name);
		}
		return names;
	}
	
	this.isHandRecyclingAllowed = function() {
		return this.game.allowHandRecycling && this.actions == 2;
	}
	
	this.applyMagnetDamageIfApplicable = function() {
		for (var i = 0; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			for (var j = 0; j < player.equippedCards.length; j++) {
				var card = player.equippedCards[j];
				if (card.effect == 'magnet') {
					this.hurtPlayer(player, card.magnitude);
				}
			}
		}
	}
	
	this.hurtPlayer = function(player, damage) {	
		player.hitPoints -= damage;
		if (player.hitPoints <= 0) {
			this.killPlayer(player);			
		}
		else {
			var draw = this.game.drawUponTakingDamage;
			if (draw) {
				for (var i = 0; i < draw.length; i++) {
					var directive = draw[i];
					playerService.draw(player, directive.deck, directive.quantity);
				}
			}
		}		
	}
	
	this.isModifierEffectApplicableToPlayer = function(effect, player) {
		if (effect.target) {
			switch (effect.target) {
				case 'other':
					return !playerService.isThisTheActivePlayer(player);
					break;
				case 'self':
					return playerService.isThisTheActivePlayer(player);
					break;
				default:
					console.log('ERROR: Modifier effect target ' + effect.target + ' is not implemented.');
					break;
			}
		}
		
		return true;
	}
	
	this.damagePlayer = function(player, damage) {		
		if (damage > 0) {
			this.hurtPlayer(player, damage);		
			this.applyMagnetDamageIfApplicable();
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
			if (card) {
				if (card.repulsed) {
					repulsedCardsInHand.push(card);
				}
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
		
		userInterface.instructions = null;
		return true;
	}
	
	this.beginNewTurn = function() {
	
		var player = playerData.players[0];
		
		for (var i = 0; i < this.game.drawUponNewTurn.length; i++) {
			var draw = this.game.drawUponNewTurn[i];
			playerService.draw(player, draw.deck, draw.quantity);
		}
		
		this.actions = 2;
		this.mana = 0;
		
		for (var i = 0; i < player.equippedCards.length; i++) {
			var card = player.equippedCards[0];
			if (isNaN(card.expendedDuration)) {
				card.expendedDuration = 0;
			}
			card.expendedDuration++;
			if (card.expendedDuration >= card.duration) {
				deckService.discard(card);
				player.equippedCards.splice(i, 1);
				i--;
			}
		}
	}
	
	this.makeInitialDraw = function(player) {
		var initialDraw = this.game.initialDraw;
		for (var i = 0; i < initialDraw.length; i++) {
			var directive = initialDraw[i];
			playerService.draw(player, directive.deck, directive.quantity);
		}
	}
	
	this.nextTurn = function() {
	
		if (!this.endTurn()) {
			return;
		}
		
		this.beginNewTurn();
	}
	
	this.recycleHand = function() {
		var activePlayer = playerData.players[0];
		playerService.discardAllCardsInHand(activePlayer);
		this.makeInitialDraw(activePlayer);
		this.nextTurn();
	}
	
	this.getGameDefinitionByGameName = function(name) {
		for (var i = 0; i < gameData.games.length; i++) {
			var game = gameData.games[i];
			if (game.name == name) {
				return game;
			}
		}
		return null;
	}
	
	this.startNewGame = function(name) {		
	
		if (name) {
			this.game = this.getGameDefinitionByGameName(name);
			var game = this.game;
			
			for (var i = 0; i < game.decks.length; i++) {
				var deck = deckService.createDeck(game.decks[i]);
				deckService.shuffle(deck);
				deckRepository.decks[deck.id] = deck;
			}
			playerData.players = playerService.loadPlayers(game);
			for (var i = 0; i < playerData.players.length; i++) {
				var player = playerData.players[i];
				this.makeInitialDraw(player);
			}
			this.beginNewTurn();
		}
		else {
			this.game = null;
		}
	}
	
});
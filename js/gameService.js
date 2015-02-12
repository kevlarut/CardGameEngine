var gameApp = angular.module('gameApp');

gameApp.service('gameService', function(deckRepository, deckService, drawService, gameData, healService, playerData, playerService, userInterface) {
	
	this.actions = 0;
	this.game = null;
	this.mana = 0;
	this.handLimit = 8;	
	
	var self = this;
	
	this.areManaRequirementsMet = function(card) {
		if (card.cost) {
			return self.mana >= card.cost;
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
		return self.game ? self.game.allowHandRecycling && self.actions == 2 : false;
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
			hurtPlayer(player, damage);		
			applyMagnetDamageIfApplicable();
		}
	}
	
	this.nextTurn = function() {	
		if (!endTurn()) {
			return;
		}
		
		beginNewTurn();
	}
	
	this.recycleHand = function() {
		var activePlayer = playerData.players[0];
		playerService.discardAllCardsInHand(activePlayer);
		makeInitialDraw(activePlayer);
		self.nextTurn();
	}
	
	this.startNewGame = function(name) {		
	
		if (name) {
			self.game = getGameDefinitionByGameName(name);
			var game = self.game;
			
			for (var i = 0; i < game.decks.length; i++) {
				var deck = deckService.createDeck(game.decks[i]);
				deckService.shuffle(deck);
				deckRepository.decks[deck.id] = deck;
			}
			playerData.players = playerService.loadPlayers(game);
			for (var i = 0; i < playerData.players.length; i++) {
				var player = playerData.players[i];
				makeInitialDraw(player);
			}
			beginNewTurn();
		}
		else {
			self.game = null;
		}
	}
	
	var applyMagnetDamageIfApplicable = function() {
		for (var i = 0; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			for (var j = 0; j < player.equippedCards.length; j++) {
				var card = player.equippedCards[j];
				if (card.effect == 'magnet') {
					hurtPlayer(player, card.magnitude);
				}
			}
		}
	}
		
	var beginNewTurn = function() {	
		var player = playerData.players[0];
		
		if (self.game.addHitPointsPerTurn) {
			healService.heal(self.game.addHitPointsPerTurn, player);
		}
		
		for (var i = 0; i < self.game.drawUponNewTurn.length; i++) {
			var draw = self.game.drawUponNewTurn[i];
			drawService.draw(player, draw.deck, draw.quantity);
		}
		
		self.actions = 2;
		self.mana = 0;
		
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
	
	var endTurn = function() {	
		var player = playerData.players[0];
	
		if (player.hand.length > self.handLimit) {
			userInterface.instructions = 'You must discard down to ' + self.handLimit + ' cards.  Click on a card to use or discard it.';
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
	
	var getGameDefinitionByGameName = function(name) {
		for (var i = 0; i < gameData.games.length; i++) {
			var game = gameData.games[i];
			if (game.name == name) {
				return game;
			}
		}
		return null;
	}
	
	var hurtPlayer = function(player, damage) {	
		player.hitPoints -= damage;
		if (player.hitPoints <= 0) {
			killPlayer(player);			
		}
		else {
			var draw = self.game.drawUponTakingDamage;
			if (draw) {
				for (var i = 0; i < draw.length; i++) {
					var directive = draw[i];
					drawService.draw(player, directive.deck, directive.quantity);
				}
			}
		}		
	}
	
	var killPlayer = function(player) {
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
			self.startNewGame();
		}
		else if (player == playerData.players[0]) {
			self.nextTurn();
		}
	}
	
	var makeInitialDraw = function(player) {
		var initialDraw = self.game.initialDraw;
		for (var i = 0; i < initialDraw.length; i++) {
			var directive = initialDraw[i];
			drawService.draw(player, directive.deck, directive.quantity);
		}
	}
	
});
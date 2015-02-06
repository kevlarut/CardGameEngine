var gameApp = angular.module('gameApp');

gameApp.controller('gameController', 
	['$scope', '$timeout', 'attackService', 'callbacks', 'cardExecutionService', 'cardService', 'deckService', 'drawService', 'gameData', 'gameService', 'healService', 'inputService', 'playerData', 'playerService', 'targetingService', 'userInterface', 
	function($scope, $timeout, attackService, callbacks, cardExecutionService, cardService, deckService, drawService, gameData, gameService, healService, inputService, playerData, playerService, targetingService, userInterface) {
 		
	$scope.attackService = attackService;
	$scope.callbacks = callbacks,
	$scope.cardExecutionService = cardExecutionService,
	$scope.cardService = cardService;
	$scope.gameData = gameData;
	$scope.gameService = gameService;
	$scope.inputService = inputService;
	$scope.playerData = playerData;
	$scope.playerService = playerService;
	$scope.userInterface = userInterface;
	$scope.theNameOfTheGame = null;
		
	$scope.discardActiveCard = function() {
		if (cardExecutionService.card) {
			if (cardExecutionService.card.type != 'oldmaid') {
				gameService.actions += cardExecutionService.card.actionCost || 1;
				deckService.discard(cardExecutionService.card);
				cardExecutionService.card = null;
			}
		}
		if (cardExecutionService.modifierCard) {
			if (cardExecutionService.modifierCard.type != 'oldmaid') {
				deckService.discard(cardExecutionService.modifierCard);
				cardExecutionService.modifierCard = null;
			}
		}
		callbacks.clearCallbacks();
	}
		
	$scope.enableManaPoints = function() {
		return gameService.game.enableManaPoints;
	}	
	
	$scope.enableVictoryPoints = function() {
		return gameService.game.enableVictoryPoints;
	}
		
	$scope.cancelActiveCard = function() {
		if (cardExecutionService.card) {
			playerData.players[0].hand.push(cardExecutionService.card);
			gameService.actions += cardExecutionService.card.actionCost || 1;
		}
		if (cardExecutionService.modifierCard) {
			playerData.players[0].hand.push(cardExecutionService.modifierCard);
		}
		$scope.clearActiveCards();
	}
	
	$scope.clearActiveCards = function() {
		cardExecutionService.card = null;
		cardExecutionService.modifierCard = null;
		callbacks.clearCallbacks();
	}
	
	$scope.equipCard = function(card, target) {
		var actionCost = card.actionCost || 1;	
		var player = playerService.getPlayerById(card.playerId);
		
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);		
		target.equippedCards.push(card);
		gameService.actions -= actionCost;
		$scope.clearActiveCards();
	}
	
	$scope.accumulateMana = function(card, modifierCard) {
	
		var manaEarned = card.magnitude;
		
		if (modifierCard && modifierCard.effect == 'x') {
			manaEarned *= modifierCard.magnitude;
		}
		
		gameService.mana += manaEarned;
		$scope.clearActiveCards();
	}
	
	$scope.draw = function(card, player, modifierCard, deckName) {
	
		var cardsToDraw = card.magnitude;
		
		if (modifierCard && modifierCard.effect == 'x') {
			cardsToDraw *= modifierCard.magnitude;
		}
		
		if (typeof card.target != 'undefined' && card.target == 'everyone') {
			playerData.players.forEach(function(player) {
				drawService.draw(player, deckName, cardsToDraw);
			});
		}
		else {
			drawService.draw(player, deckName, cardsToDraw);
		}
		
		$scope.clearActiveCards();
	}
	
	$scope.playCard = function(card, player) {
		if (gameService.actions > 0) {
			if (card.effects) {
				cardExecutionService.playCard(card, player);	
			}
			else if (card.modifierEffects) {
				cardExecutionService.playModifierCard(card, player);
			}
			else if (card.equippable) {		
				if (card.target) {
					targetingService.getTargetPlayer(function(target) {
						$scope.equipCard(card, target);
					});
				}
				else {
					$scope.equipCard(card, player);
				}
			}
			else {
				console.log('ERROR: I do not know how to play this card.');
			}
		}
	}
	
	$scope.playVictoryCard = function(card, modifierCard, player) {
		
		var magnitude = card.magnitude;
		if (modifierCard && modifierCard.effect == 'x') {
			magnitude *= modifierCard.magnitude;
		}
		
		player.victoryPoints += magnitude;
		$scope.clearActiveCards();
				
	}
	
	$scope.clickCard = function(card, player) {
		if (playerService.isThisTheActivePlayer(player)) {
			var callback = callbacks.getCallback('clickCard');
			if (callback) {
				var result = callback.func(card);
				console.log('That action is not valid.  Click on a different card.');
				if (result) {
					callbacks.clearCallback('clickCard');
				}
			}
			else if (!cardExecutionService.card) {
				$scope.playCard(card, player);
			}
		}
	}
	
	$scope.clickPlayer = function(player) {
	
		var callback = callbacks.getCallback('clickPlayer');
	
		if (callback != null && !targetingService.isPlayerDeadOrProhibited(player)) {
			callback.func(player);
			callbacks.clearCallback('clickPlayer');
		}
	}
	
	$scope.startNewGame = function() {
		if ($scope.theNameOfTheGame) {
			gameService.startNewGame($scope.theNameOfTheGame);	
		}
	}
	
	$scope.startNewGame();
	
}]);
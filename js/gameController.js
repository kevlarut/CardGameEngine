var gameApp = angular.module('gameApp');

gameApp.controller('gameController', 
	['$scope', '$timeout', 'attackService', 'callbacks', 'cardExecutionService', 'cardService', 'deckService', 'gameData', 'gameService', 'healService', 'inputService', 'playerData', 'playerService', 'targetingService', 'userInterface', 
	function($scope, $timeout, attackService, callbacks, cardExecutionService, cardService, deckService, gameData, gameService, healService, inputService, playerData, playerService, targetingService, userInterface) {
 		
	$scope.attackService = attackService;
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
		var card = cardExecutionService.card;
		if (card.type != 'oldmaid') {
			deckService.discard(card);
			cardExecutionService.card = null;
		}
	}
		
	$scope.enableManaPoints = function() {
		return gameService.game.enableManaPoints;
	}	
	
	$scope.enableVictoryPoints = function() {
		return gameService.game.enableVictoryPoints;
	}
		
	$scope.cancelActiveCard = function() {
		if (cardExecutionService.card.type != 'modifier') {
			gameService.actions++;
		}
		playerData.players[0].hand.push(cardExecutionService.card);
		$scope.clearActiveCard();
		userInterface.instructions = null;
	}
	
	$scope.clearActiveCard = function() {
		cardExecutionService.card = null;
		callbacks.clickPlayerCallback = null;
	}
		
	$scope.modifyAndPlayCard = function(targetCard, modifierCard, player) {
		if (targetCard.type == 'modifier') {
			return false;
		}
		else {
			$scope.playCard(targetCard, player, modifierCard);
			return true;
		}
	}
	
	$scope.equipCard = function(card, target) {
		var actionCost = card.actionCost || 1;	
		var player = playerService.getPlayerById(card.playerId);
		
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);		
		target.equippedCards.push(card);
		gameService.actions -= actionCost;
		$scope.clearActiveCard();
	}
	
	$scope.accumulateMana = function(card, modifierCard) {
	
		var manaEarned = card.magnitude;
		
		if (modifierCard && modifierCard.effect == 'x') {
			manaEarned *= modifierCard.magnitude;
		}
		
		gameService.mana += manaEarned;
		$scope.clearActiveCard();
	}
	
	$scope.draw = function(card, player, modifierCard, deckName) {
	
		var cardsToDraw = card.magnitude;
		
		if (modifierCard && modifierCard.effect == 'x') {
			cardsToDraw *= modifierCard.magnitude;
		}
		
		if (typeof card.target != 'undefined' && card.target == 'everyone') {
			playerData.players.forEach(function(player) {
				playerService.draw(player, deckName, cardsToDraw);
			});
		}
		else {
			playerService.draw(player, deckName, cardsToDraw);
		}
		
		$scope.clearActiveCard();
	}
	
	$scope.playCard = function(card, player, modifierCard) {
	
		if (card.effects) {
			cardExecutionService.playCard(card, player, modifierCard);	
		}
		else if (card.modifierEffects) {
			userInterface.instructions ='Click on the card you want to modify and play.';
			targetingService.getTargetCard(function(targetCard) {
				return $scope.modifyAndPlayCard(targetCard, card, player);
			});
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
			console.log('ERROR: No way to play this card has been defined.');
		}
		/*else {
			var index = player.hand.indexOf(card);
			player.hand.splice(index, 1);
			gameService.activeCard = card;
				
			if (gameService.actions > 0 && gameService.areManaRequirementsMet(card)) {						
				switch (card.type) {
					case 'attack':
						var attackCallback = function(target) {
							attackService.attack(card, target, player, modifierCard);
						};
						
						switch (card.target) {					
							case 'single':
								userInterface.instructions ='Click on a player to target.';
								targetingService.getTargetPlayer(attackCallback);
								break;
							case 'all-save-self':
								targetingService.applyCardToAllPlayersExceptActivePlayer(attackCallback);
								break;
							case 'adjacent':
								targetingService.applyCardToAdjacentPlayers(attackCallback);
								break;
							default:
								console.log('ERROR: Target type "' + card.target + '" is not implemented.');
								break;
						}
						break;
					case 'defend':
					case 'heal':
						$scope.heal(card, player, modifierCard);
						break;
					case 'draw':
						$scope.draw(card, player, modifierCard, 'main');
						break;
					case 'keep':
					case 'trap':
						if (card.target) {
							targetingService.getTargetPlayer(function(target) {
								$scope.equipCard(card, target);
							});
						}
						else {
							$scope.equipCard(card, player);
						}
						break;
					case 'mana':
						$scope.accumulateMana(card, modifierCard);
						break;
					case 'modifier':				
						userInterface.instructions ='Click on the card you want to modify and play.';
						targetingService.getTargetCard(function(targetCard) {
							return $scope.modifyAndPlayCard(targetCard, card, player);
						});
						break;
					case 'oldmaid':
						break;
					case 'victory':
						$scope.playVictoryCard(card, modifierCard, player);
						break;
					default:
						console.log('ERROR: Card type "' + card.type + '" is not implemented.');
						break;
				}
			}
			
			if (card.actions) {
				gameService.actions += card.actions;
			}
			
			if (card.type != 'modifier' && card.type != 'mana') {
				gameService.actions--;
			}
		}*/		
	}
	
	$scope.playVictoryCard = function(card, modifierCard, player) {
		
		var magnitude = card.magnitude;
		if (modifierCard && modifierCard.effect == 'x') {
			magnitude *= modifierCard.magnitude;
		}
		
		player.victoryPoints += magnitude;
		$scope.clearActiveCard();
				
	}
	
	$scope.clickCard = function(card, player) {
	
		if (playerService.isThisTheActivePlayer(player)) {	
			if (callbacks.clickCardCallback) {
				var result = callbacks.clickCardCallback(card);
				if (result) {
					callbacks.clickCardCallback = null;
				}
			}
			else if (!cardExecutionService.card) {
				$scope.playCard(card, player);
			}
		}
	}
	
	$scope.heal = function(card, player, modifierCard) {
		healService.heal(card.magnitude, player, modifierCard);
		deckService.discard(card);
		$scope.clearActiveCard();
	}
	
	$scope.clickPlayer = function(player) {
		if (callbacks.clickPlayerCallback != null) {
			userInterface.instructions = null;
			callbacks.clickPlayerCallback(player);
		}
	}
	
	$scope.startNewGame = function() {
		//$scope.theNameOfTheGame = 'nice';
		if ($scope.theNameOfTheGame) {
			gameService.startNewGame($scope.theNameOfTheGame);	
		}
	}
	
	$scope.startNewGame();
	
}]);
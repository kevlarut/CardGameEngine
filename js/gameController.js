var gameApp = angular.module('gameApp');

gameApp.controller('gameController', 
	['$scope', '$timeout', 'attackService', 'callbacks', 'deckService', 'gameData', 'gameService', 'inputService', 'playerData', 'playerService', 'targetingService', 'userInterface', 
	function($scope, $timeout, attackService, callbacks, deckService, gameData, gameService, inputService, playerData, playerService, targetingService, userInterface) {
 		
	$scope.attackService = attackService;
	$scope.gameData = gameData;
	$scope.gameService = gameService;
	$scope.inputService = inputService;
	$scope.playerData = playerData;
	$scope.playerService = playerService;
	$scope.userInterface = userInterface;
	$scope.theNameOfTheGame = null;
		
	$scope.discardActiveCard = function() {
		var card = gameService.activeCard;
		if (card.type != 'oldmaid') {
			deckService.discard(card);
			gameService.activeCard = null;
		}
	}
		
	$scope.enableManaPoints = function() {
		return gameData[$scope.theNameOfTheGame].enableManaPoints;
	}	
	
	$scope.enableVictoryPoints = function() {
		return gameData[$scope.theNameOfTheGame].enableVictoryPoints;
	}
		
	$scope.cancelActiveCard = function() {
		if (gameService.activeCard.type != 'modifier') {
			gameService.actions++;
		}
		playerData.players[0].hand.push(gameService.activeCard);
		$scope.clearActiveCard();
		userInterface.instructions = null;
	}
	
	$scope.clearActiveCard = function() {
		gameService.activeCard = null;
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
	
	$scope.equipCard = function(card, player) {
		player.equippedCards.push(card);
		$scope.clearActiveCard();
	}
	
	$scope.accumulateMana = function(card, modifierCard) {
	
		var manaEarned = card.magnitude;
		
		if (modifierCard && modifierCard.effect == 'multiply') {
			manaEarned *= modifierCard.magnitude;
		}
		
		gameService.mana += manaEarned;
		$scope.clearActiveCard();
	}
	
	$scope.draw = function(card, player, modifierCard, deckName) {
	
		var cardsToDraw = card.magnitude;
		
		if (modifierCard && modifierCard.effect == 'multiply') {
			cardsToDraw *= modifierCard.magnitude;
		}
		
		if (typeof card.target != 'undefined' && card.target == 'everyone') {
			playerData.players.forEach(function(player) {
				player.hand = player.hand.concat(deckService.draw(deckName, cardsToDraw));				
			});
		}
		else {
			player.hand = player.hand.concat(deckService.draw(deckName, cardsToDraw));
		}
		
		$scope.clearActiveCard();
	}
	
	$scope.playCard = function(card, player, modifierCard) {
		
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
		gameService.activeCard = card;
			
		if (gameService.actions > 0 && gameService.areManaRequirementsMet(card)) {						
			switch (card.type) {
				case 'attack':
					var attackCallback = function(target) {
						attackService.attack(card, target, player, modifierCard);
					};
					if (card.target == 'single') {					
						userInterface.instructions ='Click on a player to target.';
						targetingService.getTargetPlayer(attackCallback);
					}
					else if (card.target == 'all-save-self') {
						targetingService.applyCardToAllPlayersExceptActivePlayer(attackCallback);
					}
					else if (card.target == 'adjacent') {
						targetingService.applyCardToAdjacentPlayers(attackCallback);
					}
					else {
						console.log('Target type "' + card.target + '" is not implemented.');
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
					$scope.equipCard(card, player);
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
					console.log('Card type "' + card.type + '" is not implemented.');
					break;
			}
		}
		
		if (card.actions) {
			gameService.actions += card.actions;
		}
		
		if (card.type != 'modifier' && card.type != 'mana') {
			gameService.actions--;
		}
	}
	
	$scope.playVictoryCard = function(card, modifierCard, player) {
		
		var magnitude = card.magnitude;
		if (modifierCard && modifierCard.effect == 'multiply') {
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
			else if (!gameService.activeCard) {
				$scope.playCard(card, player);
			}
		}
	}
	
	$scope.heal = function(card, player, modifierCard) {
	
		var magnitude = card.damage;
		if (modifierCard && modifierCard.effect == 'multiply') {
			magnitude *= modifierCard.magnitude;
		}
	
		console.log(player.name + ' has healed ' + card.damage + ' poitns of damage using the card ' + card.title + '.');	
		player.hitPoints += magnitude;
		deckService.discard(card);
		$scope.clearActiveCard();
		userInterface.instructions = null;
	}
	
	$scope.clickPlayer = function(player) {
		if (callbacks.clickPlayerCallback != null) {
			userInterface.instructions = null;
			callbacks.clickPlayerCallback(player);
			callbacks.clickPlayerCallback = null;
		}
	}
	
	$scope.startNewGame = function() {
		if ($scope.theNameOfTheGame) {
			gameService.startNewGame($scope.theNameOfTheGame);	
		}
	}
	
	$scope.startNewGame();
	
}]);
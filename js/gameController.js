var gameApp = angular.module('gameApp');

gameApp.controller('gameController', 
	['$scope', '$timeout', 'attackService', 'callbacks', 'deck', 'gameService', 'playerData', 'playerService', 'targetingService', 'userInterface', 
	function($scope, $timeout, attackService, callbacks, deck, gameService, playerData, playerService, targetingService, userInterface) {
 		
	$scope.gameService = gameService;
	$scope.playerData = playerData;
	$scope.playerService = playerService;
	$scope.userInterface = userInterface;
	
	$scope.activeCard = null;
	
	$scope.discardActiveCard = function() {
		deck.discard($scope.activeCard);
		$scope.activeCard = null;
	}
		
	$scope.cancelActiveCard = function() {
		if ($scope.activeCard.type != 'modifier') {
			gameService.actions++;
		}
		playerData.players[0].hand.push($scope.activeCard);
		$scope.clearActiveCard();
		userInterface.instructions = null;
	}
	
	$scope.clearActiveCard = function() {
		$scope.activeCard = null;
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
	
	$scope.draw = function(card, player, modifierCard) {
	
		var cardsToDraw = card.magnitude;
		
		if (modifierCard && modifierCard.effect == 'multiply') {
			cardsToDraw *= modifierCard.magnitude;
		}
		
		player.hand = player.hand.concat(deck.draw(cardsToDraw));
		$scope.clearActiveCard();
	}
	
	$scope.playCard = function(card, player, modifierCard) {
		
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
		$scope.activeCard = card;
			
		if (gameService.actions > 0) {
			console.log(player.name + ' plays ' + card.title);
						
			switch (card.type) {
				case 'attack':
					var attackCallback = function(target) {
						$scope.attack(card, target, player, modifierCard);
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
					$scope.draw(card, player, modifierCard);
					break;
				case 'keep':
					$scope.equipCard(card, player);
					break;
				case 'modifier':				
					userInterface.instructions ='Click on the card you want to modify and play.';
					targetingService.getTargetCard(function(targetCard) {
						return $scope.modifyAndPlayCard(targetCard, card, player);
					});
					break;
				default:
					console.log('Card type "' + card.type + '" is not implemented.');
					break;
			}
		}
			
		if (card.type != 'modifier') {
			gameService.actions--;
		}
	}
	
	$scope.clickCard = function(card, player) {
		if (callbacks.clickCardCallback) {
			var result = callbacks.clickCardCallback(card);
			if (result) {
				callbacks.clickCardCallback = null;
			}
		}
		else if (!$scope.activeCard) {
			$scope.playCard(card, player);
		}
	}
	
	$scope.heal = function(card, player, modifierCard) {
	
		var magnitude = card.damage;
		if (modifierCard && modifierCard.effect == 'multiply') {
			magnitude *= modifierCard.magnitude;
		}
	
		console.log(player.name + ' has healed ' + card.damage + ' poitns of damage using the card ' + card.title + '.');	
		player.hitPoints += magnitude;
		deck.discard(card);
		$scope.clearActiveCard();
		userInterface.instructions = null;
	}
	
	$scope.attack = function(card, target, attacker, modifierCard) {		
		
		var attackWasBlockedByAttacker = false;
		var attackWasBlockedByTarget = false;
		
		if (!modifierCard || modifierCard.effect != 'unblockable')
		{
			var attackWasBlockedByTarget = attackService.spendCardToBlockAttackIfPossible(target);	
			
			if (typeof card.attackerDamage != 'undefined' && !attackWasBlockedByAttacker) {
				var attackWasBlockedByAttacker = attackService.spendCardToBlockAttackIfPossible(attacker);	
			}		
		}
				
		if (!attackWasBlockedByTarget) {			
			gameService.damagePlayer(target, card.targetDamage, modifierCard);
		}
		
		if (typeof card.attackerDamage != 'undefined' && !attackWasBlockedByAttacker) {
			gameService.damagePlayer(attacker, card.attackerDamage, modifierCard);
		}
		
		deck.discard(card);
		$scope.activeCard = null;
		userInterface.instructions = null;
	}
	
	$scope.clickPlayer = function(player) {
		if (callbacks.clickPlayerCallback != null) {
			userInterface.instructions = null;
			callbacks.clickPlayerCallback(player);
			callbacks.clickPlayerCallback = null;
		}
	}
		
	gameService.startNewGame();	
	
}]);
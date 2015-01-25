var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', 'deck', 'playerService', function($scope, $timeout, deck, playerService) {
 	
	$scope.activeCard = null;
	$scope.clickCardCallback = null;
	$scope.clickPlayerCallback = null;
	$scope.instructions = null;
	$scope.players = [];
	$scope.handLimit = 8;
	$scope.actions = 0;
	
	$scope.recycleHand = function() {
		playerService.discardAllCardsInHand($scope.players[0]);
		$scope.players[0].hand = deck.draw(5);
		$scope.nextTurn();
	}
	
	$scope.discardActiveCard = function() {
		deck.discard($scope.activeCard);
		$scope.activeCard = null;
	}
	
	$scope.nextTurn = function() {	
	
		if ($scope.players[0].hand.length > $scope.handLimit) {
			$scope.instruct('You must discard down to ' + $scope.handLimit + ' cards.  Click on a card to use or discard it.');
			return;
		}
	
		do {
			var previousPlayer = $scope.players[0];
			$scope.players.splice(0, 1);
			$scope.players.push(previousPlayer);
		} while ($scope.players[0].isDead);		
		
		var player = $scope.players[0];
		player.hand = player.hand.concat(deck.draw(2));
		$scope.actions = 2;
		
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
	
	$scope.cancelActiveCard = function() {
		if ($scope.activeCard.type != 'modifier') {
			$scope.actions++;
		}
		$scope.players[0].hand.push($scope.activeCard);
		$scope.clearActiveCard();
		$scope.instructions = null;
	}
	
	$scope.clearActiveCard = function() {
		$scope.activeCard = null;
		$scope.clickPlayerCallback = null;
	}
	
	$scope.applyCardToAllPlayersExceptActivePlayer = function(callback) {
		for (var i = 1; i < $scope.players.length; i++) {
			var player = $scope.players[i];
			if (!player.isDead) {
				callback(player);
			}
		}
	}
	
	$scope.getTargetCard = function(callback) {
		$scope.instruct('Click on the card you want to modify and play.');
		$scope.clickCardCallback = callback;
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
			
		if ($scope.actions > 0) {
			console.log(player.name + ' plays ' + card.title);
						
			switch (card.type) {
				case 'attack':
					var attackCallback = function(target) {
						$scope.attack(card, target, player, modifierCard);
					};
					if (card.target == 'single') {
						var target = $scope.getTarget(attackCallback);
					}
					else if (card.target == 'all-save-self') {
						$scope.applyCardToAllPlayersExceptActivePlayer(attackCallback);
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
					$scope.getTargetCard(function(targetCard) {
						return $scope.modifyAndPlayCard(targetCard, card, player);
					});
					break;
				default:
					console.log('Card type "' + card.type + '" is not implemented.');
					break;
			}
		}
			
		if (card.type != 'modifier') {
			$scope.actions--;
		}
	}
	
	$scope.clickCard = function(card, player) {
		if ($scope.clickCardCallback) {
			var result = $scope.clickCardCallback(card);
			if (result) {
				$scope.clickCardCallback = null;
			}
		}
		else if (!$scope.activeCard) {
			$scope.playCard(card, player);
		}
	}
	
	$scope.instruct = function(instructions) {
		$scope.instructions = instructions;
	}
	
	$scope.getTarget = function(callback) {
		$scope.instruct('Click on a player to target.');
		$scope.clickPlayerCallback = callback;
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
	}
	
	$scope.attack = function(card, target, attacker, modifierCard) {		
		
		var attackWasBlocked = false;
		
		if (!modifierCard || modifierCard.effect != 'unblockable')
		{
			for (var i = 0; i < target.equippedCards.length; i++) {
				var card = target.equippedCards[0];
				if (card.effect == 'block') {
					attackWasBlocked = true;
					break;
				}
			}
		
			if (!attackWasBlocked) {
				for (var i = 0; i < target.hand.length; i++) {				
					if ((target.hand[i].type == 'defend' || target.hand[i].type == 'block') && target.hand[i].damage >= card.targetDamage) {
						deck.discard(target.hand[i]);
						target.hand.splice(i, 1);
						attackWasBlocked = true;
						break;
					}
				}
			}
		}
				
		if (!attackWasBlocked) {			
			playerService.damagePlayer(target, card.targetDamage, modifierCard);
		}
		
		if (typeof card.attackerDamage != 'undefined') {
			playerService.damagePlayer(attacker, card.attackerDamage, modifierCard);
		}
		
		deck.discard(card);
		$scope.activeCard = null;
		$scope.instructions = null;
	}
	
	$scope.clickPlayer = function(player) {
		if ($scope.clickPlayerCallback != null) {
			$scope.instructions = null;
			$scope.clickPlayerCallback(player);
			$scope.clickPlayerCallback = null;
		}
	}
	
	$scope.init = function() {	
		deck.loadCards();
		deck.shuffle();	
		$scope.players = playerService.loadPlayers();		
		$scope.nextTurn();
	}
	
	$scope.init();	
	
}]);
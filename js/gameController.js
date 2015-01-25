var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', 'deck', function($scope, $timeout, deck) {
 	
	$scope.activeCard = null;
	$scope.clickCardCallback = null;
	$scope.clickPlayerCallback = null;
	$scope.instructions = null;
	$scope.players = [];
	$scope.handLimit = 8;
	$scope.actions = 0;
	$scope.numberOfPlayers = 4;
	
	$scope.recycleHand = function() {
		$scope.discardAllCardsInHand($scope.players[0]);
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
		
		$scope.players[0].hand = $scope.players[0].hand.concat(deck.draw(2));
		$scope.actions = 2;
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
		$scope.playCard(targetCard, player, modifierCard);
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
					$scope.heal(card, player);
					break;
				case 'modifier':
					$scope.getTargetCard(function(targetCard) {
						$scope.modifyAndPlayCard(targetCard, card, player);
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
			$scope.clickCardCallback(card);
			$scope.clickCardCallback = null;
		}
		else if (!$scope.activeCard) {
			$scope.playCard(card, player);
		}
	}
	
	$scope.discardAllCardsInHand = function(player) {
		var card = player.hand.pop();
		while (card) {
			deck.discard(card);
			card = player.hand.pop();
		}
	}
	
	$scope.killPlayer = function(player) {
		player.isDead = true;
		$scope.discardAllCardsInHand(player);
		
		var alivePlayers = 0;
		var alivePlayerName = 'Nobody';
		for (var i = 0; i < $scope.players.length; i++) {
			if (!$scope.players[i].isDead) {
				alivePlayers++;
				alivePlayerName = $scope.players[i].name;
			}
		}
		
		if (alivePlayers < 2) {
			alert('Game over! ' + alivePlayerName + ' wins.');
			$scope.init();
		}
	}
	
	$scope.damagePlayer = function(player, damage) {
		player.hitPoints -= damage;
		if (player.hitPoints <= 0) {
			$scope.killPlayer(player);			
		}
	}
	
	$scope.instruct = function(instructions) {
		$scope.instructions = instructions;
	}
	
	$scope.getTarget = function(callback) {
		$scope.instruct('Click on a player to target.');
		$scope.clickPlayerCallback = callback;
	}
	
	$scope.heal = function(card, player) {
		console.log(player.name + ' has healed ' + card.damage + ' poitns of damage using the card ' + card.title + '.');	
		player.hitPoints += card.damage;
		deck.discard(card);
		$scope.clearActiveCard();
	}
	
	$scope.attack = function(card, target, attacker, modifierCard) {		
		
		var attackWasBlocked = false;
		
		if (!modifierCard || modifierCard.effect != 'unblockable')
		{
			for (var i = 0; i < target.hand.length; i++) {				
				if ((target.hand[i].type == 'defend' || target.hand[i].type == 'block') && target.hand[i].damage >= card.targetDamage) {
					deck.discard(target.hand[i]);
					target.hand.splice(i, 1);
					attackWasBlocked = true;
					break;
				}
			}
		}
		
		if (!attackWasBlocked) {
			$scope.damagePlayer(target, card.targetDamage);
		}
		
		if (typeof card.attackerDamage != 'undefined') {
			$scope.damagePlayer(attacker, card.attackerDamage);
		}
		
		deck.discard(card);
		$scope.activeCard = null;
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
	
		var names = ['Lackadaisical Lacie', 'Johnny Come Lately', 'Brisk Brittany', 'Hurried Harry'];
		$scope.players = [];
		for (var i = 1; i <= $scope.numberOfPlayers; i++) {
			var player = {};
			player.hand = deck.draw(5);
			player.hitPoints = 5;
			player.name = names[i-1];
			$scope.players.push(player);
		}
		
		$scope.nextTurn();
	}
	
	$scope.init();	
	
}]);
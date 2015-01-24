var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', 'deck', function($scope, $timeout, deck) {
 	
	$scope.activeCard = null;
	$scope.clickPlayerCallback = null;
	$scope.instructions = null;
	$scope.players = [];
	
	$scope.nextTurn = function() {	
		var previousPlayer = $scope.players[0];
		$scope.players.splice(0, 1);
		$scope.players.push(previousPlayer);
		
		$scope.players[0].hand = $scope.players[0].hand.concat(deck.draw(2));
	}
	
	$scope.clickCard = function(card, player) {
		console.log(player.name + ' plays ' + card.title);
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
		$scope.activeCard = card;
		
		switch (card.type) {
			case 'attack':
				var target = $scope.getTarget(function(target) {
					$scope.attack(card, target, player);
				});
				break;
			case 'defend':
				$scope.heal(card, player);
				break;
			default:
				console.log('Card type "' + card.type + '" is not implemented.');
				break;
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
	}
	
	$scope.attack = function(card, target, attacker) {		
		
		var attackWasBlocked = false;
		
		for (var i = 0; i < target.hand.length; i++) {
			if (target.hand[i].type == 'defend' && target.hand[i].damage >= card.targetDamage) {
				deck.discard(target.hand[i]);
				target.hand.splice(i, 1);
				attackWasBlocked = true;
				break;
			}
		}
		
		if (typeof card.attackerDamage != 'undefined') {
			attacker.hitPoints -= card.attackerDamage;
		}
		
		if (!attackWasBlocked) {
			target.hitPoints -= card.targetDamage;
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
		for (var i = 1; i <= 4; i++) {
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
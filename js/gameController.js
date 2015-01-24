var gameApp = angular.module('gameApp');

gameApp.controller('gameController', ['$scope', '$timeout', 'deck', function($scope, $timeout, deck) {
 	
	$scope.activeCard = null;
	$scope.clickPlayerCallback = null;
	$scope.instructions = null;
	$scope.players = {};
	
	$scope.nextTurn = function() {	
		var previousPlayer = $scope.players['bottom'];
		$scope.players['bottom'] = $scope.players['left'];
		$scope.players['left'] = $scope.players['top'];
		$scope.players['top'] = $scope.players['right'];		
		$scope.players['right'] = previousPlayer;
		
		$scope.players['top'].hand = $scope.players['top'].hand.concat(deck.draw(2));
	}
	
	$scope.clickCard = function(card, player) {
		console.log(player.name + ' plays ' + card);
		player.hand.pop(card);
		$scope.activeCard = card;
		
		switch (card) {
			case 'attack':
				var target = $scope.getTarget(function(target) {
					$scope.attack(card, target, player);
				});
				break;
			case 'defend':
				console.log('NotImplemented');
				break;
			default:
				console.log('Card "' + card + '" is not implemented.');
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
	
	$scope.attack = function(card, target, attacker) {		
		
		var attackWasBlocked = false;
		console.log(attacker.name + ' has attacked ' + target.name + ' using the card ' + card + '.');
		
		for (var i = 0; i < target.hand.length; i++) {
			if (target.hand[i] == 'defend') {
				console.log(target.name + ' defended the attack from ' + attacker.name + ' using the card ' + target.hand[i] + '.');
				deck.discard(target.hand[i]);
				target.hand.pop(i);
				attackWasBlocked = true;
				break;
			}
		}
		
		if (!attackWasBlocked) {
			target.hitPoints--;
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
	
		var names = ['Johnny Come Lately', 'Hurried Harry', 'Brisk Brittany', 'Lackadaisical Lacie'];
		for (var i = 1; i <= 4; i++) {
			var player = {};
			player.hand = deck.draw(5);
			player.hitPoints = 5;
			player.name = names[i-1];
			$scope.players[i.toString()] = player;
		}
	
		$scope.players['right'] = $scope.players['1'];
		$scope.players['bottom'] = $scope.players['2'];
		$scope.players['left'] = $scope.players['3'];
		$scope.players['top'] = $scope.players['4'];
		$scope.nextTurn();
	}
	
	$scope.init();	
	
}]);
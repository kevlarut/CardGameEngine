var gameApp = angular.module('gameApp');

gameApp.service('playerService', function(deck) {

	this.numberOfPlayers = 4;
	
	this.damagePlayer = function(player, damage, modifierCard) {
	
		if (modifierCard && modifierCard.effect == 'multiply') {
			damage *= modifierCard.magnitude;
		}
	
		player.hitPoints -= damage;
		if (player.hitPoints <= 0) {
			playerService.killPlayer(player);			
		}
	}
	
	this.discardAllCardsInHand = function(player) {
		var card = player.hand.pop();
		while (card) {
			deck.discard(card);
			card = player.hand.pop();
		}
	}

	this.loadPlayers = function() {
	
		var names = ['Marathon Mary', 'Johnny Come Lately', 'Edna Endurance', 'Tenacious Terry', 'Lackadaisical Lacie', 'Brisk Brittany', 'Hurried Harry'];
		var players = [];
		for (var i = 1; i <= this.numberOfPlayers; i++) {
			var player = {};
			player.equippedCards = [];
			player.hand = deck.draw(5);
			player.hitPoints = 5;
			player.name = names[i-1];
			players.push(player);
		}
		
		return players;
	}
	
	this.killPlayer = function(player) {
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
});
var gameApp = angular.module('gameApp');

gameApp.service('targetingService', function(callbacks, playerData) {
	
	this.getTargetCard = function(callback) {
		callbacks.clickCardCallback = callback;
	}
		
	this.getTargetPlayer = function(callback) {
		callbacks.clickPlayerCallback = callback;
	}
	
	this.applyCardToAllPlayersExceptActivePlayer = function(callback) {
		for (var i = 1; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			if (!player.isDead) {
				callback(player);
			}
		}
	}
	
	this.applyCardToAdjacentPlayers = function(callback) {
		
		var appliedPlayerIndex = null;
		
		for (var i = 1; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			if (!player.isDead) {
				appliedPlayerIndex = i;
				callback(player);
				break;
			}
		}
		
		for (var i = playerData.players.length - 1; i > 0; i--) {
			var player = playerData.players[i];
			if (!player.isDead) {
				if (i == appliedPlayerIndex) {
					break;
				}
				else {
					callback(player);
					break;
				}
			}
		}
	}
	
});
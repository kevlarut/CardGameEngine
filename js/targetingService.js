var gameApp = angular.module('gameApp');

gameApp.service('targetingService', function(callbacks, playerData, userInterface) {
	
	this.getTargetPlayers = function(targetType, callback) {
		switch (targetType) {
			case 'adjacent':
				this.applyCardToAdjacentPlayers(callback);
				break;
			case 'all':
				this.applyCardToAllPlayers(callback);
				break;
			case 'any':
				this.getTargetPlayer(callback);
				break;
			case 'self':
				callback(playerData.players[0]);
				break;
			default:
				console.log('ERROR: targetType ' + targetType + ' is not defined.');
				break;
		}
	}
		
	this.getTargetCard = function(callback) {
		callbacks.clickCardCallback = callback;
	}
		
	this.getTargetPlayer = function(callback) {
		userInterface.instructions = 'Click on a player to target.';
		callbacks.clickPlayerCallback = callback;
	}
	
	this.applyCardToAllPlayers = function(callback) {
		var targets = [];
		for (var i = 0; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			if (!player.isDead) {
				targets.push(player);
			}
		}
		callback(targets);
	}
	
	this.applyCardToAllPlayersExceptActivePlayer = function(callback) {
		var targets = [];
		for (var i = 1; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			if (!player.isDead) {
				targets.push(player);
			}
		}
		callback(targets);
	}
	
	this.applyCardToAdjacentPlayers = function(callback) {
		
		var targets = [];
		var appliedPlayerIndex = null;
		
		for (var i = 1; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			if (!player.isDead) {
				appliedPlayerIndex = i;
				targets.push(player);
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
					targets.push(player);
					break;
				}
			}
		}
		
		callback(targets);
	}
	
});
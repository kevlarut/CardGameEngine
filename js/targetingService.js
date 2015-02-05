var gameApp = angular.module('gameApp');

gameApp.service('targetingService', function(callbacks, playerData, userInterface) {
	
	this.prohibitedTargetPlayerIds = [];
		
	var self = this;
	
	this.getTargetCard = function(callback) {	
		callbacks.setCallback('clickCard', callback, 'Click on the card you want to modify and play.');
	}
	
	this.getTargetPlayer = function(callback) {
		var message = 'Click on a player to target.';
		callbacks.setCallback('clickPlayer', callback, message);
	}
	
	this.getTargetPlayers = function(targetType, callback) {
		switch (targetType) {
			case 'adjacent':
				applyCardToAdjacentPlayers(callback);
				break;
			case 'all':
				applyCardToAllPlayers(callback);
				break;
			case 'any':
				self.getTargetPlayer(callback);
				break;
			case 'self':
				callback(playerData.players[0]);
				break;			
			default:
				console.log('ERROR: targetType ' + targetType + ' is not defined.');
				break;
		}
	}
	
	this.isPlayerDeadOrProhibited = function(player) {
		
		if (player.isDead) {
			return true;
		}
		
		for (var i = 0; i < self.prohibitedTargetPlayerIds; i++) {
			var prohibitedTargetPlayerId = self.prohibitedTargetPlayerIds[i];
			if (prohibitedTargetPlayerId == player.id) {
				return true;
			}
		}
		
		return false;
	}
	
	var guessCardInDeck = function(deck, callback) {
		console.log('ERROR: guessCardInDeck is not implemented.');
		callback(null);
	}
	
	var applyCardToAllPlayers = function(callback) {
		var targets = [];
		for (var i = 0; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			if (!self.isPlayerDeadOrProhibited(player)) {
				targets.push(player);
			}
		}
		callback(targets);
	}
	
	var applyCardToAllPlayersExceptActivePlayer = function(callback) {
		var targets = [];
		for (var i = 1; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			if (!self.isPlayerDeadOrProhibited(player)) {
				targets.push(player);
			}
		}
		callback(targets);
	}
	
	var applyCardToAdjacentPlayers = function(callback) {
		
		var targets = [];
		var appliedPlayerIndex = null;
		
		for (var i = 1; i < playerData.players.length; i++) {
			var player = playerData.players[i];
			if (!self.isPlayerDeadOrProhibited(player)) {
				appliedPlayerIndex = i;
				targets.push(player);
				break;
			}
		}
		
		for (var i = playerData.players.length - 1; i > 0; i--) {
			var player = playerData.players[i];
			if (!self.isPlayerDeadOrProhibited(player)) {
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
var gameApp = angular.module('gameApp');

gameApp.service('playerData', function() {

	this.numberOfPlayers = 4;
	this.players = [];
	
});
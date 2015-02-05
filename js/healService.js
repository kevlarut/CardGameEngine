var gameApp = angular.module('gameApp');

gameApp.service('healService', function() {

	this.heal = function(magnitude, player) {
	
		var maximumHitPoints = 10;
		var newHitPoints = player.hitPoints + magnitude;
		if (newHitPoints > maximumHitPoints) {
			newHitPoints = maximumHitPoints;
		}
	
		player.hitPoints = newHitPoints;
	}
});
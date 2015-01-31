var gameApp = angular.module('gameApp');

gameApp.service('cardExecutionService', function(gameService, targetingService, deckService, userInterface) {
	
	this.card = null;
	this.pendingEffects = 0;
	
	this.applyEffect = function(effect, targetPlayer, modifierCard) {
		switch (effect.effect) {
			case 'damage':
				gameService.damagePlayer(targetPlayer, effect.magnitude, modifierCard);
				break;
			default:
				console.log('ERROR: effect ' + effect.effect + ' is not defined.');
				break;
		}
		
		this.pendingEffects--;
		if (this.pendingEffects == 0) {
			this.disposeCard();
		}
	}
	
	this.disposeCard = function() {
		deckService.discard(this.card);
		this.card = null;
		userInterface.instructions = null;
	}
	
	this.playCard = function(card, player, modifierCard) {
		
		this.card = card;
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
			
		if (gameService.actions > 0 && gameService.areManaRequirementsMet(card)) {					
			
			var service = this;
			
			if (card.effects) {
				this.pendingEffects = card.effects.length;
				card.effects.forEach(function(effect, cardExecutionService) {
					var targets = targetingService.getTargetPlayers(effect.target, function(target) { service.applyEffect(effect, target, modifierCard); });
				});
			}
			
		}
		
		if (card.actions) {
			gameService.actions += card.actions;
		}
		
		if (card.type != 'modifier' && card.type != 'mana') {
			gameService.actions--;
		}
	}
	
});
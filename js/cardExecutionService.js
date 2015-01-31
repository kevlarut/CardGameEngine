var gameApp = angular.module('gameApp');

gameApp.service('cardExecutionService', function(gameService, targetingService, deckService, userInterface) {
	
	this.card = null;
	
	this.applyEffect = function(effects, index, targetOrTargets, modifierCard, service, disposeAfterwards) {
		
		if (Array.isArray(targetOrTargets)) {
			for (var i = 0; i < targetOrTargets.length; i++) {
				service.applyEffect(effects, index, targetOrTargets[i], modifierCard, service, false);
			}
			if (disposeAfterwards) {			
				if (index == effects.length - 1) {
					this.disposeCard();
				}
				else {
					this.targetAndAffect(effects, index + 1, modifierCard, service);
				}		
			}
		}
		else {			
			var effect = effects[index];				
			switch (effect.effect) {
				case 'damage':
					gameService.damagePlayer(targetOrTargets, effect.magnitude, modifierCard);
					break;
				default:
					console.log('ERROR: effect ' + effect.effect + ' is not defined.');
					break;
			}
			
			if (disposeAfterwards) {			
				if (index == effects.length - 1) {
					this.disposeCard();
				}
				else {
					this.targetAndAffect(effects, index + 1, modifierCard, service);
				}		
			}
		}
	}
	
	this.targetAndAffect = function(effects, index, modifierCard, service) {
		targetingService.getTargetPlayers(effects[index].target, function(target) 
		{ 
			service.applyEffect(effects, index, target, modifierCard, service, true); 
		});
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
				this.targetAndAffect(card.effects, 0, modifierCard, service);
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
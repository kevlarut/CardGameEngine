var gameApp = angular.module('gameApp');

gameApp.service('cardExecutionService', function(attackService, gameService, healService, targetingService, deckService, userInterface, callbacks) {
	
	this.card = null;
	this.cancellable = true;
	
	this.applyEffect = function(effects, index, targetOrTargets, modifierCard, service) {
	
		this.cancellable = false;
		if (Array.isArray(targetOrTargets)) {
			for (var i = 0; i < targetOrTargets.length; i++) {
				var dispose = (i == targetOrTargets.length - 1);
				service.applyEffectOnSingleTarget(effects, index, targetOrTargets[i], modifierCard, service, dispose);
			}
		}
		else {
			service.applyEffectOnSingleTarget(effects, index, targetOrTargets, modifierCard, service, true);
		}
	}
	
	this.executeSingleEffect = function(effect, target, modifierCard) {
	
		var result = {
			blocked: false,
			deflected: false
		};
	
		switch (effect.effect) {
			case 'actions':
				gameService.actions += effect.magnitude;
				break;
			case 'damage':
				if (!modifierCard || modifierCard.effect != 'unblockable') {
					result = attackService.spendCardToBlockAttackIfPossible(target);					
				}
				if (!result.blocked) {
					gameService.damagePlayer(target, effect.magnitude, modifierCard);
				}
				break;
			case 'heal':
				healService.heal(effect.magnitude, target, modifierCard);
				break;
			default:
				console.log('ERROR: effect ' + effect.effect + ' is not defined.');
				break;
		}
		
		return result;
	}
	
	this.applyEffectOnSingleTarget = function(effects, index, target, modifierCard, service, disposeAfterwards) {
	
		var effect = effects[index];
		
		var result = this.executeSingleEffect(effect, target, modifierCard);
		
		if (disposeAfterwards) {
			if (index == effects.length - 1) {
				this.disposeCard();
			}
			else {
				this.targetAndExecute(effects, index + 1, modifierCard, service, disposeAfterwards);
			}		
		}
				
		if (result.deflected) {
			this.targetAndExecuteDeflection(effect, modifierCard, service);
		}
		
	}
	
	this.clearCallbacks = function() {	
		callbacks.clickCardCallback = null;
		callbacks.clickPlayerCallback = null;
		callbacks.textInputCallback = null;
	}
	
	this.targetAndExecuteDeflection = function(effect, modifierCard, service) {
		userInterface.instructions = 'Choose a player to deflect to.';
		this.clearCallbacks();
		targetingService.getTargetPlayers('any', function(target) 
		{
			service.executeSingleEffect(effect, target, modifierCard);
		});
	}
	
	this.targetAndExecute = function(effects, index, modifierCard, service) {
		this.clearCallbacks();
		targetingService.getTargetPlayers(effects[index].target, function(target) 
		{
			service.applyEffect(effects, index, target, modifierCard, service, true); 
		});
	}
	
	this.disposeCard = function() {
		if (this.card) {
			deckService.discard(this.card);
			this.card = null;
			userInterface.instructions = null;
			this.clearCallbacks();
			this.cancellable = true;
		}
	}
	
	this.playCard = function(card, player, modifierCard) {
		
		this.card = card;
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
			
		if (gameService.actions > 0 && gameService.areManaRequirementsMet(card)) {					
			
			var service = this;
			
			if (card.effects) {
				this.targetAndExecute(card.effects, 0, modifierCard, service);
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
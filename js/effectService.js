var gameApp = angular.module('gameApp');

gameApp.service('effectService', function(attackService, callbacks, drawService, gameService, healService, targetingService, userInterface) {

	var self = this;
						
	this.applyEffect = function(effects, index, targetOrTargets, modifierCard, disposalCallback, targetAcquiredCallback) {	
		if (Array.isArray(targetOrTargets)) {
			applyEffectsOnMultipleTargets(targetOrTargets, disposalCallback, effects, index, modifierCard, targetAcquiredCallback);
		}
		else {
			self.applyEffectsOnSingleTarget(effects, index, targetOrTargets, modifierCard, disposalCallback, targetAcquiredCallback);
		}
	}
	
	this.applyEffectsOnSingleTarget = function(effects, index, target, modifierCard, disposalCallback, targetAcquiredCallback) {
	
		var effect = effects[index];
		
		var result = self.executeSingleEffect(effect, target, modifierCard);
		
		if (disposalCallback) {
			if (index == effects.length - 1) {
				disposalCallback();
			}
			else {
				self.targetAndExecute(effects, index + 1, modifierCard, targetAcquiredCallback);
			}		
		}
				
		if (result.deflected) {
			self.targetAndExecuteDeflection(effect, modifierCard);
		}
		
		targetingService.prohibitedTargetPlayerIds.push(target.id);
		
	}
	
	this.executeSingleEffect = function(effect, target, modifierCard) {
	
		var result = {
			blocked: false,
			deflected: false
		};
	
		var magnitude = modifyMagnitude(effect, modifierCard, target);
	
		switch (effect.effect) {
			case 'actions':
				gameService.actions += magnitude;
				break;
			case 'damage':			
				if (!modifierCard || (!cardService.doesCardContainModifierEffect(modifierCard, 'unblockable') && modifierCard.effect != 'unblockable')) {
					result = attackService.spendCardToBlockAttackIfPossible(target);					
				}
				if (!result.blocked) {
					gameService.damagePlayer(target, magnitude);
				}
				break;
			case 'draw':
				var deckId = effect.deckId || 'main';
				drawService.draw(target, deckId, magnitude);				
				break;
			case 'heal':
				healService.heal(magnitude, target);
				break;
			default:
				console.log('ERROR: effect ' + effect.effect + ' is not defined.');
				break;
		}
		
		return result;
	}
	
	this.targetAndExecute = function(effects, index, modifierCard, targetAcquiredCallback) {
		callbacks.clearCallbacks();
		
		targetingService.getTargetPlayers(effects[index].target, function(target) {
			targetAcquiredCallback(effects, index, target, modifierCard);
		});
	}
	
	var modifyMagnitude = function(effect, modifierCard, player) {
	
		var magnitude = effect.magnitude;
		if (!magnitude) {
			return null;
		}
	
		if (modifierCard) {
			if (modifierCard.modifierEffects) {
				for (var i = 0; i < modifierCard.modifierEffects.length; i++) {
					var effect = modifierCard.modifierEffects[i];
					if (gameService.isModifierEffectApplicableToPlayer(effect, player)) {
						switch(effect.effect) {
							case '+':
								magnitude += effect.magnitude;
								break;
							case 'x':				
								magnitude *= effect.magnitude;
								break;
						}
					}
				}
			}
			else if (modifierCard.effect) {
				switch(modifierCard.effect) {
					case '+':				
						magnitude += modifierCard.magnitude;
						break;
					case 'x':				
						magnitude *= modifierCard.magnitude;
						break;
				}
			}
			else {
				console.log('ERROR: Modifier card has neither effect nor modifierEffects!');
			}
		}
		
		return magnitude;
	}

	this.targetAndExecuteDeflection = function(effect, modifierCard) {
		userInterface.instructions = 'Choose a player to deflect to.';
		callbacks.clearCallbacks();
		targetingService.getTargetPlayers('any', function(target) 
		{
			callbacks.clearCallbacks();
			self.executeSingleEffect(effect, target, modifierCard);
		});
	}
	
	var applyEffectsOnMultipleTargets = function(targets, disposalCallback, effects, index, modifierCard, targetAcquiredCallback) {
		for (var i = 0; i < targets.length; i++) {
			var dispose = (i == targets.length - 1) ? disposalCallback : null;
			self.applyEffectsOnSingleTarget(effects, index, targets[i], modifierCard, dispose, targetAcquiredCallback);
		}
	}
});
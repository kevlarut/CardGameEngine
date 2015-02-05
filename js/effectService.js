var gameApp = angular.module('gameApp');

gameApp.service('effectService', function(attackService, drawService, gameService, healService) {

	var self = this;
		
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
});
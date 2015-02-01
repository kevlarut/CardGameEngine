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
				targetAndExecute(effects, index + 1, modifierCard, service, disposeAfterwards);
			}		
		}
				
		if (result.deflected) {
			targetAndExecuteDeflection(effect, modifierCard, service);
		}
		
	}
		
	this.disposeCard = function() {
		if (this.card) {
			deckService.discard(this.card);
			this.card = null;
			userInterface.instructions = null;
			clearCallbacks();
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
				verifyConditionsAndTargetAndExecute(card.effects, 0, modifierCard, service);
			}			
		}
		
		if (card.actions) {
			gameService.actions += card.actions;
		}
		
		if (card.type != 'modifier' && card.type != 'mana') {
			gameService.actions--;
		}
	}	
	
	var clearCallbacks = function() {	
		callbacks.clickCardCallback = null;
		callbacks.clickPlayerCallback = null;
		callbacks.textInputCallback = null;
	}
	
	var targetAndExecute = function(effects, index, modifierCard, service) {
		clearCallbacks();
		targetingService.getTargetPlayers(effects[index].target, function(target) {
			service.applyEffect(effects, index, target, modifierCard, service, true); 
		});
	}
	
	var targetAndExecuteDeflection = function(effect, modifierCard, service) {
		userInterface.instructions = 'Choose a player to deflect to.';
		clearCallbacks();
		targetingService.getTargetPlayers('any', function(target) 
		{
			service.executeSingleEffect(effect, target, modifierCard);
		});
	}
	
	var verifyConditionsAndTargetAndExecute = function(effects, index, modifierCard, service) {
	
		if (effects[index].condition) {
			var condition = effects[index].condition;
			switch (condition.condition) {
				case 'guessed-card-exists-in-target-players-hand':					
					userInterface.instructions = 'Click on the card you want to guess.';
					targetingService.guessCardInDeck(condition.deck, function(cardName) {
						console.log('ERROR: The callback for guessCardInDeck needs to compare the cardName to the target player\'s hand, and execute if it exists, or cancel the effect if not.');
						targetAndExecute(effects, 0, modifierCard, service);
					});
					break;
				default:
					console.log('ERROR: Condition ' + condition.condition + ' is undefined.');
					break;
			}
		}
		else {
			targetAndExecute(effects, 0, modifierCard, service);
		}
	}
	
});
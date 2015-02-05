var gameApp = angular.module('gameApp');

gameApp.service('cardExecutionService', function(attackService, cardService, drawService, gameService, healService, targetingService, deckService, userInterface, callbacks) {
	
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
		
		targetingService.prohibitedTargetPlayerIds.push(target.id);
		
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
		targetingService.prohibitedTargetPlayerIds = [];
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
			var actionCost = card.actionCost || 1;
			gameService.actions -= actionCost;
		}
	}
	
	this.playModifierCard = function(card, player) {	
		this.card = card;
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
		
		userInterface.instructions = 'Click on the card you want to modify and play.';
		var service = this;
		targetingService.getTargetCard(function(targetCard) {
			return modifyAndPlayCard(targetCard, card, player, service);
		});
	}
	
	var modifyAndPlayCard = function(targetCard, card, player, service) {
		if (targetCard.type == 'modifier') {
			return false;
		}
		else {
			service.playCard(targetCard, player, card);
			return true;
		}
	}
	
	var clearCallbacks = function() {	
		callbacks.clickCardCallback = null;
		callbacks.clickPlayerCallback = null;
		callbacks.textInputCallback = null;
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
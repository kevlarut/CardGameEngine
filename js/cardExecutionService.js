var gameApp = angular.module('gameApp');

gameApp.service('cardExecutionService', function(attackService, cardService, drawService, effectService, gameService, healService, targetingService, deckService, userInterface, callbacks) {
	
	this.card = null;
	this.cancellable = true;
			
	var self = this;
			
	this.applyEffect = function(effects, index, targetOrTargets, modifierCard, service) {
	
		var disposalCallback = function() {
			self.disposeCard();
		};
	
		self.cancellable = false;
		if (Array.isArray(targetOrTargets)) {
			applyEffectsOnMultipleTargets(targetOrTargets, disposalCallback, effects, index, modifierCard, service);
		}
		else {
			service.applyEffectsOnSingleTarget(effects, index, targetOrTargets, modifierCard, service, disposalCallback);
		}
	}
	
	this.applyEffectsOnSingleTarget = function(effects, index, target, modifierCard, service, disposalCallback) {
	
		var effect = effects[index];
		
		var result = effectService.executeSingleEffect(effect, target, modifierCard);
		
		if (disposalCallback) {
			if (index == effects.length - 1) {
				disposalCallback();
			}
			else {
				targetAndExecute(effects, index + 1, modifierCard, service);
			}		
		}
				
		if (result.deflected) {
			targetAndExecuteDeflection(effect, modifierCard);
		}
		
		targetingService.prohibitedTargetPlayerIds.push(target.id);
		
	}
		
	this.disposeCard = function() {
		if (self.card) {
			deckService.discard(self.card);
			self.card = null;
			userInterface.instructions = null;
			clearCallbacks();
			self.cancellable = true;
		}
	}
		
	this.playCard = function(card, player, modifierCard) {
		
		self.card = card;
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
		self.card = card;
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
		
		userInterface.instructions = 'Click on the card you want to modify and play.';
		var service = this;
		targetingService.getTargetCard(function(targetCard) {
			return modifyAndPlayCard(targetCard, card, player, service);
		});
	}
	
	var applyEffectsOnMultipleTargets = function(targets, disposalCallback, effects, index, modifierCard, service) {
		for (var i = 0; i < targets.length; i++) {
			var dispose = (i == targets.length - 1) ? disposalCallback : null;
			service.applyEffectsOnSingleTarget(effects, index, targets[i], modifierCard, service, dispose);
		}
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
		
	var targetAndExecute = function(effects, index, modifierCard, service) {
		clearCallbacks();
		targetingService.getTargetPlayers(effects[index].target, function(target) {
			service.applyEffect(effects, index, target, modifierCard, service, true); 
		});
	}
	
	var targetAndExecuteDeflection = function(effect, modifierCard) {
		userInterface.instructions = 'Choose a player to deflect to.';
		clearCallbacks();
		targetingService.getTargetPlayers('any', function(target) 
		{
			effectService.executeSingleEffect(effect, target, modifierCard);
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
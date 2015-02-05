var gameApp = angular.module('gameApp');

gameApp.service('cardExecutionService', function(attackService, cardService, drawService, effectService, gameService, healService, targetingService, deckService, userInterface, callbacks) {
	
	this.card = null;
	this.cancellable = true;
			
	var self = this;
		
	this.disposeCard = function() {
		if (self.card) {
			deckService.discard(self.card);
			self.card = null;
			userInterface.instructions = null;
			callbacks.clearCallbacks();
			self.cancellable = true;
		}
	}
		
	this.playCard = function(card, player, modifierCard) {
		
		self.card = card;
		targetingService.prohibitedTargetPlayerIds = [];
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
			
		if (gameService.actions > 0 && gameService.areManaRequirementsMet(card)) {	
			if (card.effects) {
			
				var conditionMetCallback = function() {
					effectService.targetAndExecute(card.effects, 0, modifierCard, targetAcquiredCallback);
				}
			
				effectService.verifyConditionsAndTargetAndExecute(card.effects[0], conditionMetCallback);
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
		targetingService.getTargetCard(function(targetCard) {
			return modifyAndPlayCard(targetCard, card, player);
		});
	}	
	
	var modifyAndPlayCard = function(targetCard, card, player) {
		if (targetCard.type == 'modifier') {
			return false;
		}
		else {
			self.playCard(targetCard, player, card);
			return true;
		}
	}
		
	var targetAcquiredCallback = function(effects, index, target, modifierCard) {	
		var disposalCallback = function() {
			self.disposeCard();
		};		
		self.cancellable = false;			
		effectService.applyEffect(effects, index, target, modifierCard, disposalCallback, targetAcquiredCallback);
	}
	
});
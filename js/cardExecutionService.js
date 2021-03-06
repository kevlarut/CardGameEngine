var gameApp = angular.module('gameApp');

gameApp.service('cardExecutionService', function(attackService, cardService, drawService, effectService, gameService, healService, targetingService, deckService, callbacks) {
	
	this.card = null;
	this.modifierCard = null;
	this.cancellable = true;
			
	var self = this;
		
	this.disposeCard = function() {
		if (self.card) {
			deckService.discard(self.card);
			self.card = null;
		}
		if (self.modifierCard) {
			deckService.discard(self.modifierCard);
			self.modifierCard = null;
		}
		callbacks.clearCallbacks();
		self.cancellable = true;
	}
	
	this.playCard = function(card, player) {
		
		var modifierCard = self.modifierCard;
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
		self.modifierCard = card;
		var index = player.hand.indexOf(card);
		player.hand.splice(index, 1);
		
		targetingService.getTargetCard(function(targetCard) {
			return modifyAndPlayCard(targetCard, player);
		});
	}	
	
	var modifyAndPlayCard = function(targetCard, player) {
		if (targetCard.type == 'modifier') {
			return false;
		}
		else {
			self.playCard(targetCard, player);
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
var gameApp = angular.module('gameApp');

gameApp.service('attackService', function(callbacks, deck, gameService, userInterface) {
	
	this.goFishConditionHasBeenMet = false;
	
	this.attack = function(card, target, attacker, modifierCard) {		
		
		var attackWasBlockedByAttacker = false;
		var attackWasBlockedByTarget = false;
		
		if (this.haveConditionsHaveBeenMetForThisAttack(card, target, attacker, modifierCard)) {		
			if (!modifierCard || modifierCard.effect != 'unblockable')
			{
				var attackWasBlockedByTarget = this.spendCardToBlockAttackIfPossible(target);	
				
				if (typeof card.attackerDamage != 'undefined' && !attackWasBlockedByAttacker) {
					var attackWasBlockedByAttacker = this.spendCardToBlockAttackIfPossible(attacker);	
				}		
			}
					
			if (!attackWasBlockedByTarget) {			
				gameService.damagePlayer(target, card.targetDamage, modifierCard);
			}
			
			if (typeof card.attackerDamage != 'undefined' && !attackWasBlockedByAttacker) {
				gameService.damagePlayer(attacker, card.attackerDamage, modifierCard);
			}
			
			this.endAttack(card);
		}
	}
	
	this.endAttack = function(card) {	
		deck.discard(card);
		gameService.activeCard = null;
		userInterface.instructions = null;
	}
	
	this.haveConditionsHaveBeenMetForThisAttack = function(card, target, attacker, modifierCard) {	
		if (card.condition) {		
			switch (card.condition) {
				case 'gofish':
				
					if (this.goFishConditionHasBeenMet) {
						this.goFishConditionHasBeenMet = false;
						return true;
					}
					else {				
						userInterface.instructions = 'Enter the name of the card you think your target has.';
						userInterface.shouldShowTextInput = true;						
						callbacks.textInputCallback = function(input, attackService) {
							for (var i = 0; i < target.hand.length && !attackService.goFishConditionHasBeenMet; i++) {
								var targetCard = target.hand[i];
								if (targetCard.title === input) {
									attackService.goFishConditionHasBeenMet = true;
									target.hand.splice(i, 1);
									attackService.attack(card, target, attacker, modifierCard);
								}
							}
							
							if (!attackService.goFishConditionHasBeenMet) {
								attackService.endAttack(card);
							}
						}
					}
					break;
					
				default:
					console.log('ERROR: Card condition ' + card.condition + ' has not been implemented.');
					break;
			}
		
			return false;
		}
		else {
			return true;
		}
	}
	
	this.spendCardToBlockAttackIfPossible = function(target) {
	
		var blocked = false;
	
		for (var i = 0; i < target.equippedCards.length; i++) {
			var card = target.equippedCards[0];
			if (card.effect == 'block') {
				blocked = true;
				break;
			}
		}
	
		if (!blocked) {
			for (var i = 0; i < target.hand.length; i++) {				
				if ((target.hand[i].type == 'defend' || target.hand[i].type == 'block')) {
					deck.discard(target.hand[i]);
					target.hand.splice(i, 1);
					blocked = true;
					break;
				}
			}
		}
		
		return blocked;
	}
	
});
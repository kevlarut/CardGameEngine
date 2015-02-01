var gameApp = angular.module('gameApp');

gameApp.service('attackService', function(callbacks, deckService, gameService, playerService, userInterface) {
		
	this.attack = function(card, target, attacker, modifierCard) {		
		
		var attackWasBlockedByAttacker = false;
		var attackWasBlockedByTarget = false;
			
		this.playAllApplicableTrapCards(target, attacker);
	
		if (!modifierCard || modifierCard.effect != 'unblockable')
		{
			var attackWasBlockedByTarget = this.spendCardToBlockAttackIfPossible(target).blocked;	
			
			if (typeof card.attackerDamage != 'undefined' && !attackWasBlockedByAttacker) {
				var attackWasBlockedByAttacker = this.spendCardToBlockAttackIfPossible(attacker).blocked;
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
	
	this.endAttack = function(card) {
		deckService.discard(card);
		gameService.activeCard = null;
		userInterface.instructions = null;
	}
		
	this.playAllApplicableTrapCards = function(defender, attacker) {
	
		console.log('defender = ' + defender + '; defender.equippedCards = ' + defender.equippedCards);
	
		var applicableTrapCards = defender.equippedCards.filter(function(card) {
			return card.type === 'trap';
		});
		applicableTrapCards.forEach(function(card) {
			switch (card.effect) {
				case 'damage':
					gameService.damagePlayer(attacker, card.magnitude, null);
					break;
				default:
					console.log('ERROR: Effect type "' + card.effect + '" is not implemented for trap cards.');
					break;
			}
			
			playerService.discardSpecificEquippedCard(defender, card);
		});
	}
	
	this.doesCardContainEffect = function(card, effect) {
		if (card.reactionEffects) {
			for (var i = 0; i < card.reactionEffects.length; i++) {
				if (card.reactionEffects[i].effect == effect) {
					return true;
				}
			}
		}
		return false;
	}
	
	this.spendCardToBlockAttackIfPossible = function(target) {
	
		var blocked = false;
		var deflected = false;
	
		for (var i = 0; i < target.equippedCards.length; i++) {
			var card = target.equippedCards[0];
			if (card.effect == 'vulnerability') {
				return {
					blocked: false,
					deflected: false
				};
			}
		}
	
		for (var i = 0; i < target.equippedCards.length; i++) {
			var card = target.equippedCards[0];
			if (this.doesCardContainEffect(card, 'deflect')) {
			
				if (card.type == 'trap') {
					deckService.discard(card);
					target.equippedCards.splice(i, 1);
				}
				
				deflected = true;
				blocked = true;
				break;
			}
		}
		
		for (var i = 0; i < target.equippedCards.length; i++) {
			var card = target.equippedCards[0];
			if (card.effect == 'block' || this.doesCardContainEffect(card, 'block')) {
			
				if (card.type == 'trap') {
					deckService.discard(card);
					target.equippedCards.splice(i, 1);
				}
					
				blocked = true;
				break;
			}
		}
	
		if (!blocked) {
			for (var i = 0; i < target.hand.length; i++) {				
				var card = target.hand[i];
				if (card.type == 'defend' || card.type == 'block' || (card.type != 'trap' && this.doesCardContainEffect(card, 'block'))) {
					deckService.discard(card);
					target.hand.splice(i, 1);
					blocked = true;
					break;
				}
			}
		}
		
		var result = {
			blocked: blocked,
			deflected: deflected
		};
		return result;
	}
	
});
var gameApp = angular.module('gameApp');

gameApp.service('deck', function() {

	this.cards = [];
	this.discardPile = [];

	this.discard = function(card) {
		this.discardPile.push(card);
	}
	
	this.loadCards = function() {
		for (var i = 0; i < 10; i++) {
			this.cards.push({
				type: 'defend',
				title: 'Defend',
				description: 'Block or heal 1 damage.',
				damage: 1
			});
		}
		for (var i = 0; i < 10; i++) {
			this.cards.push({
				type: 'block',
				title: 'Block',
				description: 'Block 1 damage.',
				damage: 1
			});
		}
		for (var i = 0; i < 10; i++) {
			this.cards.push({
				type: 'heal',
				title: 'Heal',
				description: 'Heal 1 damage.',
				damage: 1
			});
		}
		for (var i = 0; i < 25; i++) {
			this.cards.push({
				type: 'attack',
				title: 'Attack',
				description: 'Deal 1 damage to a target player.',
				target: 'single',
				targetDamage: 1
			});
		}
		for (var i = 0; i < 10; i++) {
			this.cards.push({
				type: 'attack',
				title: 'Mutual Attack',
				description: 'Deal 1 damage to a target player, and 1 damage to yourself.',
				target: 'single',
				targetDamage: 1,
				attackerDamage: 1
			});
		}
		for (var i = 0; i < 10; i++) {
			this.cards.push({
				type: 'attack',
				title: 'Attack Everyone Else',
				description: 'Deal 1 damage to everyone but yourself.',
				target: 'all-save-self',
				targetDamage: 1
			});
		}
		for (var i = 0; i < 10; i++) {
			this.cards.push({
				type: 'modifier',
				title: 'Unblock-able',
				description: 'When played with an attack, that attack cannot be blocked.',
				effect: 'unblockable'
			});
		}
	}
	
	this.shuffle = function() {
		for(
			var j, x, i = this.cards.length; 
			i; 
			j = Math.floor(Math.random() * i), 
			x = this.cards[--i], this.cards[i] = this.cards[j], 
			this.cards[j] = x);
	}
	
	this.draw = function(numberOfCardsToDraw) {
		var drawnCards = [];
		
		for (var i = 0; i < numberOfCardsToDraw; i++) {
		
			if (this.cards.length == 0) {
				this.cards = this.discardPile;
				this.discardPile = [];
				this.shuffle();
			}
		
			var card = this.cards.pop();
			drawnCards.push(card);
		}
		
		return drawnCards;
	}	
});
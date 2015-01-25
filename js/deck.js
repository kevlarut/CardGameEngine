var gameApp = angular.module('gameApp');

gameApp.service('deck', function() {

	this.cards = [];
	this.discardPile = [];

	this.discard = function(card) {
		card.expendedDuration = 0;
		this.discardPile.push(card);
	}
	
	this.addCardsToDeck = function(card, quantity) {
		for (var i = 0; i < quantity; i++) {
			this.cards.push(card);
		}
	}
	
	this.loadCards = function() {
	
		this.addCardsToDeck({
			type: 'defend',
			title: 'Defend',
			description: 'Block 1 attack or heal 1 damage.',
			damage: 1
		}, 10);
		
		this.addCardsToDeck({
			type: 'block',
			title: 'Block',
			description: 'Block 1 attack.',
			damage: 1
		}, 10);
		
		this.addCardsToDeck({
			type: 'heal',
			title: 'Heal',
			description: 'Heal 1 damage.',
			damage: 1
		}, 10);
		
		this.addCardsToDeck({
			type: 'attack',
			title: 'Attack',
			description: 'Deal 1 damage to a target player.',
			target: 'single',
			targetDamage: 1
		}, 25);
		this.addCardsToDeck({
			type: 'attack',
			title: 'Mutual Attack',
			description: 'Deal 2 damage to a target player, and 1 damage to yourself.',
			target: 'single',
			targetDamage: 2,
			attackerDamage: 1
		}, 10);
		this.addCardsToDeck({
			type: 'attack',
			title: 'Attack Everyone Else',
			description: 'Deal 1 damage to everyone but yourself.',
			target: 'all-save-self',
			targetDamage: 1
		}, 10);
		this.addCardsToDeck({
			type: 'attack',
			title: 'Proximity Attack',
			description: 'Deal 1 damage to each player on your immediate right and left.',
			target: 'adjacent',
			targetDamage: 1
		}, 10);
		
		this.addCardsToDeck({
			type: 'modifier',
			title: 'Unblock-able',
			description: 'When played with an attack, that attack cannot be blocked.',
			effect: 'unblockable'
		}, 10);
		this.addCardsToDeck({
			type: 'modifier',
			title: 'Double',
			description: 'Double the effect of any card.',
			effect: 'multiply',
			magnitude: 2
		}, 10);
		
		this.addCardsToDeck({
			type: 'keep',
			title: 'Immunity',
			description: 'You are immune from attacks this round, unless they are Unblockable.',
			effect: 'block',
			duration: 1
		}, 10);
		
		this.addCardsToDeck({
			type: 'draw',
			title: 'Draw 3',
			description: 'Draw 3 cards.',
			effect: 'draw',
			magnitude: 3
		}, 10);
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
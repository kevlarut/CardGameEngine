var gameApp = angular.module('gameApp');

gameApp.service('deck', function() {

	this.cards = [];
	this.discardPile = [];

	this.discard = function(card) {
		card.expendedDuration = 0;
		this.discardPile.push(card);
	}
	
	this.addCardsToDeck = function(card) {
		var quantity = card.quantity;
		delete card.quantity;
		for (var i = 0; i < quantity; i++) {
			this.cards.push(card);
		}
	}
	
	this.loadCards = function(gameDeckData) {	
		for (var i = 0; i < gameDeckData.cards.length; i++) {
			var card = gameDeckData.cards[i];
			this.addCardsToDeck(card);
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
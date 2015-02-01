var gameApp = angular.module('gameApp');

gameApp.service('deckService', function(deckRepository) {

	this.discard = function(card) {
		card.expendedDuration = 0;
		var deck = deckRepository.decks[card.deckId];		
		deck.discardPile.push(card);
	}
	
	this.clone = function(source) {
		return JSON.parse(JSON.stringify(source));
	}
	
	this.addCardsToDeck = function(deck, cardDefinition) {	
		
		var quantity = cardDefinition.quantity;				
		for (var i = 0; i < quantity; i++) {
			var card = this.clone(cardDefinition);	
			card.deckId = deck.id;
			delete card.flavors;
			delete card.quantity;
			
			if (cardDefinition.flavors && cardDefinition.flavors.length > i) {
				card.title = cardDefinition.flavors[i];
			}
			
			deck.cards.push(card);
		}
	}
	
	this.createDeck = function(data) {
		
		var deck = {
			id: data.id,
			cards: [],
			discardPile: []
		};
		
		for (var i = 0; i < data.cards.length; i++) {
			var card = data.cards[i];
			this.addCardsToDeck(deck, card);
		}
		
		return deck;
	}
	
	this.shuffle = function(deck) {
		for(
			var j, x, i = deck.cards.length; 
			i; 
			j = Math.floor(Math.random() * i), 
			x = deck.cards[--i], deck.cards[i] = deck.cards[j], 
			deck.cards[j] = x);
	}
	
	this.draw = function(deckId, numberOfCardsToDraw) {
		
		var deck = deckRepository.decks[deckId];
		var drawnCards = [];
		
		for (var i = 0; i < numberOfCardsToDraw; i++) {
		
			if (deck.cards.length == 0) {
				deck.cards = deck.discardPile;
				deck.discardPile = [];
				this.shuffle(deck);
			}
		
			if (deck.cards.length > 0) {
				var card = deck.cards.pop();
				drawnCards.push(card);
			}
		}
		
		return drawnCards;
	}	
});
var gameApp = angular.module('gameApp');

gameApp.service('gameData', function() {
	
	this.games = [
		{
			name: 'Generic Card Game',
			allowHandRecycling: true,
			initialHitPoints: 5,
			initialDraw: [{deck: 'main', quantity: 5}],
			drawUponNewTurn: [{deck: 'main', quantity: 2}],
			decks: [{
				id: 'main',
				cards: [
					{
						type: 'defend',
						title: 'Defend',
						description: 'Block 1 attack or heal 1 damage.',
						effects: [{
							target: 'self',
							effect: 'heal',
							magnitude: 1
						}],						
						reactionEffects: [{
							effect: 'block'
						}],
						quantity: 10
					},
					{
						type: 'heal',
						title: 'Heal',
						description: 'Heal 1 damage.',
						effects: [{
							effect: 'heal',
							target: 'self',
							magnitude: 1
						}],
						quantity: 10
					},				
					{
						type: 'attack',
						title: 'Attack',
						description: 'Deal 1 damage to a target player.',
						effects: [{
							target: 'any',
							effect: 'damage',
							magnitude: 1
						}],
						quantity: 25
					},
					{
						type: 'attack',
						title: 'Mutual Attack',
						description: 'Deal 2 damage to a target player, and 1 damage to yourself.',
						effects: [{
							target: 'any',
							effect: 'damage',
							magnitude: 2
						},
						{
							target: 'self',
							effect: 'damage',
							magnitude: 1
						}],
						quantity: 10
					},
					{
						type: 'attack',
						title: 'Attack Everyone Else',
						description: 'Deal 1 damage to everyone but yourself.',
						effects: [{
							target: 'all-save-self',
							effect: 'damage',
							magnitude: 1
						}],
						quantity: 10
					},
					{
						type: 'attack',
						title: 'Proximity Attack',
						description: 'Deal 1 damage to each player on your immediate right and left.',
						effects: [{
							target: 'adjacent',
							effect: 'damage',
							magnitude: 1
						}],
						quantity: 10
					},
					{
						type: 'modifier',
						title: 'Unblockable',
						description: 'When played with an attack, that attack cannot be blocked.',
						effect: 'unblockable',
						quantity: 10
					},
					{
						type: 'modifier',
						title: 'Double',
						description: 'Double the effect of any card.',
						effect: 'x',
						magnitude: 2,
						quantity: 10
					},
					{
						type: 'keep',
						title: 'Immunity',
						description: 'You are immune from attacks this round, unless they are Unblockable.',
						effect: 'block',
						duration: 1,
						quantity: 5
					},
					{
						type: 'draw',
						title: 'Draw 3',
						description: 'Draw 3 cards.',
						magnitude: 3,
						quantity: 10
					},
					{
						type: 'trap',
						title: 'Trap',
						description: 'Equip face down.  When you are attacked, the attacker takes 1 damage.',
						effect: 'damage',
						magnitude: 1,
						quantity: 10
					},
					{
						type: 'trap',
						title: 'Decoy Trap',
						description: 'Equip face down.  When you are attacked, discard.',
						quantity: 10
					},
					{
						type: 'draw',
						title: 'Multi-Draw',
						description: 'Everyone gets a card.  Choose yours, then rotate leftward.  +1 Action',
						magnitude: 1,
						target: 'everyone',
						quantity: 5,
						actions: 1
					}
				]
			}]		
		},
		{
			name: 'Mudslinger',
			allowHandRecycling: false,
			enableManaPoints: true,
			enableVictoryPoints: true,
			initialHitPoints: 3,
			initialDraw: [{deck: 'scandals', quantity: 1}, {deck: 'main', quantity: 4}],
			drawUponNewTurn: [{deck: 'main', quantity: 1}],
			drawUponTakingDamage: [{deck: 'scandals', quantity: 1}],
			decks: [{
				id: 'main',
				cards: [			
					{
						type: 'attack',
						title: 'Attack Ad',
						description: 'Guess a scandal.  If target has that scandal in his hand, he takes 1 damage.',
						target: 'single',
						condition: 'gofish',
						targetDamage: 1,
						quantity: 10
					},
					{
						type: 'draw',
						title: 'Campaign Fundraiser',
						description: 'Draw 3 cards.',
						magnitude: 3,
						quantity: 10
					},
					{
						type: 'mana',
						title: '1 Money',
						description: 'Needed to play constituency cards.',
						magnitude: 1,
						quantity: 10
					},
					{
						type: 'victory',
						title: 'Moms Against Substance Abuse',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You sold drugs to children.'
					},
					{
						type: 'victory',
						title: 'Traditional Marriage Advocates',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You had an affair.'
					},
					{
						type: 'victory',
						title: 'Veterans',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You dodged the draft.'
					},
					{
						type: 'victory',
						title: 'Religious Right',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You are a closet Satanist.'
					},
					{
						type: 'victory',
						title: 'Black Rights Activists',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You attended a KKK rally.'
					},
					{
						type: 'victory',
						title: 'A.S.P.C.A.',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You hosted a cockfight.'
					},
					{
						type: 'victory',
						title: 'Former Alcoholics',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You are a drunkard.'
					},
					{
						type: 'victory',
						title: 'Educators',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You don\'t know how to read.'
					},
					{
						type: 'victory',
						title: 'Border-State Citizens',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You hired illegal aliens.'
					},
					{
						type: 'victory',
						title: 'Fiscal Conser-vatives',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You are deeply in debt.'
					},
					{
						type: 'victory',
						title: 'Honest Taxpayers',
						description: 'Constituency.  Play 3 to win.  Cost: 1',
						magnitude: 1,
						quantity: 1,
						cost: 1,
						repulsed: 'You cheated on your taxes.'
					},
				]
			},
			{
				id: 'scandals',
				cards: [
					{
						type: 'oldmaid',
						title: 'You sold drugs to children.',
						description: 'Discard Moms Against Substance Abuse.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You had an affair.',
						description: 'Discard Traditional Marriage Advocates.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You dodged the draft.',
						description: 'Discard Veterans.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You are a closet Satanist.',
						description: 'Discard Religious Right.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You attended a KKK rally.',
						description: 'Discard Black Rights Activists.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You hosted a cockfight.',
						description: 'Discard A.S.P.C.A.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You are a drunkard.',
						description: 'Discard Former Alcoholics.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You don\'t know how to read.',
						description: 'Discard Educators.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You hired illegal aliens.',
						description: 'Discard Border-State Citizens.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You are deeply in debt.',
						description: 'Discard Fiscal Conser-vatives.',
						quantity: 1
					},
					{
						type: 'oldmaid',
						title: 'You cheated on your taxes.',
						description: 'Discard Honest Taxpayers.',
						quantity: 1
					},
				]
			}]	
		},
		{
			name: 'Fat Bridesmaids',
			allowHandRecycling: false,
			initialHitPoints: 10,
			initialDraw: [{deck: 'main', quantity: 5}],
			drawUponNewTurn: [{deck: 'main', quantity: 2}],
			playerNames: ['Tiny Tina', 'Slender Susan', 'Competitive Cathy', 'Plump Pamela', 'Fat Francine'],
			decks: [{
				id: 'main',
				cards: [
					{
						type: 'attack',
						title: 'Feed',
						effects: [{
							target: 'any',
							effect: 'damage',
							magnitude: 1
						}],
						flavors: ['Try this terrific tiramisu.', 'Eat this excellent eclair.', 'Consume this crazy cantaloupe.', 'Swallow some of this sweet and salty sauce.', 'Devour this delicious devil\'s cake, dear.', 'Inhale this incredible ice cream.', 'Dine on these delectable dates.', 'Nibble these nummy nuts.', 'Here, I made you some cookies since you\'re totes my BFF.'],
						quantity: 9
					},			
					{
						type: 'attack',
						title: 'Share Food',
						effects: [{
							target: 'any',
							effect: 'damage',
							magnitude: 1
						},
						{
							target: 'self',
							effect: 'damage',
							magnitude: 1
						}],
						flavors: ['Let\'s split this banana split.', 'This is just too much for me to eat all by myself.', 'Let\'s do a Ladies\' Lunch.', 'We eat everything together, like conjoined twin sisters.', 'Share and Share Alike', 'Will you split this with me?', 'This looks soooo good.  Want to try it with me?', 'I bought us some chocolate and a rom-com DVD.'],
						quantity: 8
					},
					{
						type: 'attack',
						title: 'Girl\'s Night Out',
						effects: [{
							target: 'all',
							effect: 'damage',
							magnitude: 1
						}],
						quantity: 2
					},
					{
						type: 'attack',
						title: 'Triple-Layer Cake',
						effects: [{
							target: 'any',
							effect: 'damage',
							magnitude: 1
						},
						{
							target: 'any',
							effect: 'damage',
							magnitude: 1
						},
						{
							target: 'self',
							effect: 'damage',
							magnitude: 1
						}],
						quantity: 1
					},	
					{
						type: 'attack',
						title: 'Side of Beef',
						effects: [{
							target: 'adjacent',
							effect: 'damage',
							magnitude: 1
						}],
						quantity: 1
					},
					{
						type: 'reaction',
						title: 'Refuse Food',
						reactionEffects: [{
							effect: 'block'
						}],
						flavors: ['My mouth is already full.', 'I literally can\'t even.', 'I gave that up for Lent, even though I\'m not Catholic.', 'I think I\'m allergic to that.', 'Eww.  Is that even gluten free?', 'Yeah, I can\'t eat that, since I\'m a vegan now.', 'I only eat food that doesn\'t have a face.'],
						quantity: 7
					},
					{
						type: 'trap',
						title: 'Block Trap',
						reactionEffects: [{
							effect: 'block'
						}],
						flavors: ['My spiritual advisor told me not to eat that.', 'Appetite Suppressant', 'I saw something on Oprah about how that gives you cancer.'],
						quantity: 3
					},
					{
						type: 'trap',
						title: 'She wants it more.',
						reactionEffects: [{
							effect: 'deflect',
							target: 'any'
						}],
						quantity: 1
					},
					{
						type: 'keep',
						title: 'You are suddently SUPER hungry.',
						description: 'You cannot block any attacks this turn.',
						effect: 'vulnerability',
						target: 'any',
						duration: 1,
						quantity: 1,
					},
					{
						type: 'keep',
						title: 'Diet',
						description: 'You are immune from attacks this round, unless they are Unblockable.',
						effect: 'block',
						duration: 1,
						quantity: 1
					},
					{
						type: 'keep',
						title: 'See-Food Diet',
						description: 'Pick a target.  Whenever she sees someone else eat, she has to eat too.',
						effect: 'magnet',
						magnitude: 1,
						target: 'any',
						duration: 1,
						quantity: 1,
					},
					{
						type: 'heal',
						title: 'Let\'s go to the ladies\' room together and purge.',
						effects: [{
							target: 'any',
							effect: 'heal',
							magnitude: 1
						},
						{
							target: 'self',
							effect: 'heal',
							magnitude: 1
						}],
						quantity: 1
					},				
					{
						type: 'modifier',
						title: 'Hmm.  The label says this is high in carbs.',
						modifierEffects: [{
							effect: '+',
							magnitude: 1
						}],
						magnitude: 1,
						flavors: ['MSG!'],
						quantity: 2
					},
					{
						type: 'modifier',
						title: 'I don\'t like the way this tastes, but I\'ll bet you\'d love it.',
						modifierEffects: [{
							effect: '+',
							magnitude: 1,
							target: 'other'
						},
						{
							effect: '+',
							magnitude: -1,
							target: 'self'
						}],
						quantity: 1
					},				
					{
						type: 'modifier',
						title: 'This will go straight to your thighs.',
						description: 'When played with an attack, that attack cannot be blocked.',
						effect: 'unblockable',
						quantity: 1
					},
					{
						type: 'misc',
						title: 'Feeding Frenzy',
						description: 'You get +2 actions.',
						actions: 3,
						quantity: 1
					},	
				]
			}]		
		}];	
});
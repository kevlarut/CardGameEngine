var gameApp = angular.module('gameApp');

gameApp.service('gameData', function() {
	
	this.gameKeys = [ 
		'generic',
		'mudslinger'
	] 
	
	this.generic = {
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
					damage: 1,
					quantity: 10
				},
				{
					type: 'heal',
					title: 'Heal',
					description: 'Heal 1 damage.',
					damage: 1,
					quantity: 10
				},				
				{
					type: 'attack',
					title: 'Attack',
					description: 'Deal 1 damage to a target player.',
					target: 'single',
					targetDamage: 1,
					quantity: 25
				},
				{
					type: 'attack',
					title: 'Mutual Attack',
					description: 'Deal 2 damage to a target player, and 1 damage to yourself.',
					target: 'single',
					targetDamage: 2,
					attackerDamage: 1,
					quantity: 10
				},
				{
					type: 'attack',
					title: 'Attack Everyone Else',
					description: 'Deal 1 damage to everyone but yourself.',
					target: 'all-save-self',
					targetDamage: 1,
					quantity: 10
				},
				{
					type: 'attack',
					title: 'Proximity Attack',
					description: 'Deal 1 damage to each player on your immediate right and left.',
					target: 'adjacent',
					targetDamage: 1,
					quantity: 10
				},
				{
					type: 'modifier',
					title: 'Unblock-able',
					description: 'When played with an attack, that attack cannot be blocked.',
					effect: 'unblockable',
					quantity: 10
				},
				{
					type: 'modifier',
					title: 'Double',
					description: 'Double the effect of any card.',
					effect: 'multiply',
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
	}
	
	this.mudslinger = {
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
	}
});
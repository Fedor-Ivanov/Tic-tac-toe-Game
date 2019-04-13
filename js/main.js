'use strict';

var grid = {
	map: [
		['', '', ''],
		['', '', ''],
		['', '', '']
	],
	tic: [
		['', '', ''],
		['', '', ''],
		['', '', '']
	],
	tac: [
		['', '', ''],
		['', '', ''],
		['', '', '']
	]
};

var options = {
	step: true,
	sign: ['o', 'x'], // [false, true]
	players: ['Player 1', 'Computer'],
	locked: false,
	bot: false,
	gameEnded: false,
};

// var topList = [{
// 	nickName: 'str',
// 	wins: 0,
// 	games: 0,
// 	averageTime: 12336547896,
// 	streak: {
// 		current: 0,
// 		top: 7
// 	}
// }];

var topList = [];

var gameZone  = document.querySelector('.tic-tac-toe'),
	tabs      = document.querySelector('.tabs'),
	tabsItem  = tabs.querySelectorAll('.tabs-item'),
	tabsBtn   = tabs.querySelectorAll('.tabs-toggle__btn'),
	playBtn   = document.querySelector('.modal-window__play'),
	gameTitle = document.querySelector('.tic-tac-toe__title'),
	gameArea  = document.querySelector('.tic-tac-toe-background'),
	playAgain = document.querySelector('.modal-window__again'),
	newGame   = document.querySelector('.modal-window__new'),
	topListElem = document.querySelector('.tic-tac-toe-top-list');

tabsBtn.forEach(function(el) {
	el.addEventListener('click', function(event) {
		var index = Array.from(el.parentNode.children).indexOf(el);

		tabs.querySelector('.tabs-toggle__btn_active').classList.remove('tabs-toggle__btn_active');
		el.classList.add('tabs-toggle__btn_active');

		tabs.querySelector('.tabs-item_active').classList.remove('tabs-item_active');
		tabsItem[index].classList.add('tabs-item_active');
	});
});

document.querySelectorAll('.modal-window__input').forEach(function(el) {
	el.addEventListener('keydown', function() {
		checkInput(this);
	});
	el.addEventListener('keyup', function() {
		checkInput(this);
	});
	el.addEventListener('keypress', function() {
		checkInput(this);
	});
	el.addEventListener('change', function() {
		checkInput(this);
	});
});

playBtn.addEventListener('click', function() {

	var single = document.querySelector('#singleMode').classList.contains('tabs-toggle__btn_active'),
		inputs = document.querySelectorAll('.modal-window__input');

	if (single) {
		let singleName = document.querySelector('#singleName'),
			singleSide = document.querySelector('#side1').checked;

		if (singleName.value.length < 3 ) {
			singleName.classList.add('modal-window__input_error');
			return;
		} else {
			options.players[0] = singleName.value;
			options.bot = true;
			if (!singleSide) options.players.reverse();

			modalHide();
		}
	} else {
		let names = document.querySelectorAll('.modal-window-multiplayer-item__input'),
			checkError = false;

		names.forEach(function(el, i) {
			if (el.value.length < 3 ) {
				el.classList.add('modal-window__input_error');
				checkError = true;
			}		
			else {
				var check = Array.from(names).every(function(elem) {
					return elem.value.length >= 3;
				});

				if (check) {
					options.players[i] = el.value;
					checkError = false;
					modalHide();
				}
			}
		}); 

		if (checkError) return;
	}

	options.singleMode = document.querySelector('#singleMode').classList.contains('tabs-toggle__btn_active');	

	inputs.forEach((el) => {
		el.value = '';
	});

	gameArea.classList.add('tic-tac-toe-background_active');
	changeTitle();
	createTopList();
});

playAgain.addEventListener('click', () => {
	resetGame();
	modalHide();
	changeTitle();
	createTopList();
});

newGame.addEventListener('click', () => {
	resetGame();
	modalHide();
	modalShow('#startGame');
	createTopList();
});

gameZone.addEventListener('click', function(event) {
	if (options.locked) return;


	var cell = event.target.closest('.tic-tac-toe__col');
	if ( !cell || cell.children.length ) return;

	gameStep(cell);

	if(options.locked && !options.gameEnded) {
		let emptyCells = [];

		document.querySelectorAll('.tic-tac-toe__col').forEach((el) => {
			if ( el.children.length == 0 ) emptyCells.push(el);
		});

		setTimeout( () => {
			gameStep(emptyCells[getRnd(emptyCells.length)]);
		}, getRnd(2000));
	}	
});

modalShow('#startGame');

function checkCombo(arr) {
	var topLine    = l(arr[0][0]) && l(arr[0][1]) && l(arr[0][2]),
		midLine    = l(arr[1][0]) && l(arr[1][1]) && l(arr[1][2]),
		botLine    = l(arr[2][0]) && l(arr[2][1]) && l(arr[2][2]),
		leftLine   = l(arr[0][0]) && l(arr[1][0]) && l(arr[2][0]),
		centerLine = l(arr[0][1]) && l(arr[1][1]) && l(arr[2][1]),
		rightLine  = l(arr[0][2]) && l(arr[1][2]) && l(arr[2][2]),
		toBotRight = l(arr[0][0]) && l(arr[1][1]) && l(arr[2][2]),
		toBotLeft  = l(arr[0][2]) && l(arr[1][1]) && l(arr[2][0]),
		draw       = grid.map.every(function(el) {
			return el.every(function(innerEl) {
				return innerEl.length;
			});
		});

	let titleElem = document.querySelector('.modal-window_type_end-game .modal-window__title'),
		textElem  = document.querySelector('.modal-window_type_end-game .modal-window__text');

	if ( topLine || midLine || botLine || leftLine || centerLine || rightLine || toBotRight || toBotLeft ) {
		options.gameEnded = true;
		addToStorage();
		createTopList();

		let winner = options.players[Number(!options.step)],
			title  = `${winner}, you win!`,
			text = `<b>${winner}</b>, you fucking winner!!!`;

		titleElem.innerText = title;
		textElem.innerHTML = text;	


		document.querySelector('.modal-window_type_end-game .modal-window__title').innerText = title;	 

		if ( options.step ) {
			console.log('Tic WINS', winner);
			modalShow('#endGame');
		} else {
			console.log('Tac WINS', winner);
			modalShow('#endGame');
		}
	} else if ( draw ) {
		options.gameEnded = true;
		addToStorage();
		createTopList();

		let title = 'It`s a draw',
			text  = `<b>${options.players[0]}</b> and <b>${options.players[1]}</b> are idiots!`;

		titleElem.innerText = title;
		textElem.innerHTML	= text;	

		console.log('its a fucking draw');
		modalShow('#endGame');
	}

	function l(str) {
		return str.length;
	}
}

function checkInput(item) {
	if (item.value.length >= 3) {
		item.classList.remove('modal-window__input_error');
	}
}

function modalShow(id) {
	var overlay = document.querySelector('.modal-overlay'),
		modal 	= document.querySelector(id);

	overlay.classList.add('modal-overlay_show');
	modal.classList.add('modal-window_show');
}

function modalHide() {
	var overlay = document.querySelector('.modal-overlay'),
		modal 	= document.querySelectorAll('.modal-window');

	overlay.classList.remove('modal-overlay_show');
	modal.forEach(function(el) {
		el.classList.remove('modal-window_show');
	});
}

function changeTitle() {
	var player = options.players[Number(!options.step)];

	gameTitle.innerText = player + ', your turn!';
}

function resetGame() {

	options.step      = true;
	options.bot       = options.singleMode ? true : false;
	options.locked    = false;
	options.gameEnded = false;


	for(let key in grid) {
		grid[key].forEach((el) => {
			el.forEach((el, i, arr) => {
				arr[i] = '';	
			}); 
		});
	}

	tabsBtn.forEach((el, i) =>{
		if( !i) {
			el.classList.add('tabs-toggle__btn_active');
		} else{
			el.classList.remove('tabs-toggle__btn_active');
		}
	});

	tabsItem.forEach((el, i) =>{
		if( !i) {
			el.classList.add('tabs-item_active');
		} else{
			el.classList.remove('tabs-item_active');
		}
	});

	document.querySelector('#side1').checked = true;

	[...gameZone.children].forEach((el) => {
		[...el.children].forEach((el) => {
			if (el.firstChild) el.firstChild.remove();
		});
	});
};

function getRnd(max) {
	return Math.floor(Math.random() * max);
}

function gameStep(elem) {

	var item = document.createElement('div');

	if (!options.step) item.classList.add('tic-tac-toe__tic');
	else      item.classList.add('tic-tac-toe__tac');


	elem.appendChild(item);

	var indexRow = Array.from(elem.closest('.tic-tac-toe').children).indexOf(elem.parentNode),
		indexCol = Array.from(elem.parentNode.children).indexOf(elem);

	if ( options.step ) {
		grid.tic[indexRow][indexCol] = 'x';
	} else {
		grid.tac[indexRow][indexCol] = 'o';
	}

	grid.map[indexRow][indexCol] = options.step ? 'x': 'o';

	checkCombo( options.step ? grid.tic : grid.tac );

	options.step = !options.step;
	if ( options.bot ) options.locked = !options.locked;
	changeTitle();
}

function createTopList() {
	if (localStorage.getItem('topListData')) {
		topList = JSON.parse(localStorage.getItem('topListData'));
	}

	topListElem.innerHTML = '';
	topList.sort((a, b) => {
		return b.wins - a.wins;
	})

		if(topList.length) {
			topList.forEach((el) => { 
			let li    = document.createElement('li'),
				name  = document.createElement('span'),
				count = document.createElement('span');

				name.innerText  = el.nickname;
				count.innerText = el.wins;

				li.appendChild(name);
				li.appendChild(count);

				topListElem.appendChild(li);
			});

	} else{
		topListElem.innerHTML = '<li class="no-results">No results</li>';
	}
}

function addToStorage() {
	var winner = +(!options.step);

	options.players.forEach((el, i) => {
		if (checkName(el) ) {
			let index;

			for (let i = 0; i < topList.length; i++) {
				if ( el.toLowerCase() == topList[i].nickname.toLowerCase() ) {
					index = i;
					break;
				}
			}

			topList[index].games += 1;
			if (el == options.players[winner]) {
				topList[index].wins += 1;
			}
		} else {
			topList.push({
				nickname: el,
				wins: i == winner ? 1 : 0,
				games: 1
			});
		}
	});

	localStorage.setItem('topListData', JSON.stringify(topList));
	console.log(topList);
}

function checkName(name) {
	var check = false;

	for (let i = 0; i < topList.length; i++) {
		if ( name.toLowerCase() == topList[i].nickname.toLowerCase() ) {
			check = true;
			break
		}
	}

	return check
}
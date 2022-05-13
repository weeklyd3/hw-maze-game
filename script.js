function init(username) {
    globalThis.name = username;
    return io.connect('', { query: { name: username } });
}
function nameTaken(username) {
    if (globalThis.name === username) {
        document.body.textContent = 'Name taken';
    }
}
function posChange(people) {

}
function logMessage(person, text) {
    console.log(person);
    console.log(text);
    var li = document.createElement('li');
    var sayer = document.createElement('div');
    sayer.style.fontWeight = 'bold';
    sayer.textContent = person;
    var message = document.createElement('div');
    message.textContent = text;
    li.appendChild(sayer);
    li.appendChild(message);
    document.getElementById('chat').appendChild(li);
}
function sendMessage(message) {
    if (message) {
        document.getElementById('chat-input').value = '';
        socket.emit('message', message);
    }
}
function people(p) {
    console.log('--> updating people');
    for (var i = 0; i < document.getElementById('map').children.length; i++) {
        var child = document.getElementById('map').children[i].children;
        for (var j = 0; j < child.length; j++) {
            console.log('Clearing colors for:');
            console.log(child[j]);
            child[j].classList.remove('me');
            child[j].classList.remove('other');
        }
    }
    for (var i = 0; i < p.length; i++) {
        var person = p[i];
        console.log('Current person:');
        console.log(p[i]);
        if (person.name === globalThis.name) {
            console.log('This is you.');
            document.getElementById(`r${person.position[1]}c${person.position[0]}`).classList.add('me');
            globalThis.currentCoords = person.position;
            console.log('Position saved in browser.');
        } else {
            console.log('This is someone else.');
            document.getElementById(`r${person.position[1]}c${person.position[0]}`).classList.add('other');
        }
    }
    console.log('Finished.');
}
function initKeyboard() {
    document.onkeydown = function(ev) {
        switch (ev.keyCode) {
            case 37:
                // Left key
                goAbs(-1, 0);
                break;
            case 40:
                goAbs(0, 1);
                break;
            case 39:
                goAbs(1, 0);
                break;
            case 38:
                goAbs(0, -1);
                break;
        }
    }
}
/* 
    Go to an absolute position.
*/
function goAbs(x, y) {
    var c = globalThis.currentCoords;
    go(c[0] + x, c[1] + y);
}
function go(x, y) {
    if (x < 0 || x > 9 || y < 0 || y > 9) return;
    socket.emit('positionChange', x, y);
}
function coins(places) {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            document.getElementById(`r${i}c${j}`).classList.remove('coin');
            document.getElementById(`r${i}c${j}`).classList.remove('mine');
            if (places[i][j].here.indexOf('coin') > -1) document.getElementById(`r${i}c${j}`).classList.add('coin');
            if (places[i][j].here.indexOf('mine') > -1) document.getElementById(`r${i}c${j}`).classList.add('mine');
        }
    }
}
function coin(number) {
    if (number < 0) {
        // Out!
        socket.disconnect();
        document.getElementById('gameplay').style.display = 'none';
        document.getElementById('out').style.display = 'block';
        document.getElementById('entergame').hidden = '';
    }
    document.getElementById('coinNumber').textContent = number;
}

var lb = document.querySelector("ol");
function coinNumbers(num) {
    var keys = Object.keys(num);
    var values = Object.values(num);

    var sortedKeys = [];
    var sortedValues = [];

    for (const x in values) {
        let added = false;
        for (const v in sortedValues) {
            if (values[x] > sortedValues[v]) {
                sortedKeys.splice(v, 0, keys[x])
                sortedValues.splice(v, 0, values[x]);
                added = true;
                break;
            }
        }

        if (!added) {
            sortedKeys.push(keys[x]);
            sortedValues.push(values[x])
        }
    }
    lb.innerHTML = '';
    for (var i = 0; i < keys.length; i++) {
        var li = document.createElement('li');
        li.textContent = `${sortedKeys[i]}: ${sortedValues[i]}`;
        lb.appendChild(li);
    }
}
/* 
    The configuration for the maze
    game. Please edit variables to
    change the configuration.

    Be aware that any change to
    this configuration will require
    a server restart.
*/
// The probability of getting a mine
// added instead of a coin.
var probabilityOfMine = 0.5;

// The default x and y coordinates
// of new players.
var defaultX = 0;
var defaultY = 0;
// Default coin number for new players.
var defaultCoinNumber = 0;
/* Stop editing beyond this point */
module.exports = {
    probabilityOfMine: probabilityOfMine,
    defaultX: defaultX,
    defaultY: defaultY,
    defaultCoinNumber: defaultCoinNumber
}
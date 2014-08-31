'use strict';


var minesweeper = {
    constants: {
        empty: '\u00A0',
        bomb: '\u2620',
        flag: '\u2691'
    },


    CellStates: {
        CLOSED: 0,
        MARKED: 1,
        OPEN: 2
    },

    _getFieldCoordinates: function (width, height) {
        var coordinates = [];

        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                coordinates.push([x, y]);
            }
        }

        return coordinates;
    },

    _placeMines: function (field) {
        var coordinates = _.shuffle(field.coordinates);
        var minesCounter = field.mines;

        _.each(coordinates, function (coordinate) {
            field.data[coordinate] = {
                symbol: minesCounter > 0 ? minesweeper.constants.bomb : minesweeper.constants.empty,
                cellState: minesweeper.CellStates.CLOSED
            };
            minesCounter--;
        });

        return field;
    },

    _neighbors: function (coordinates, fieldWidth, fieldHeight) {
        var x = coordinates[0];
        var y = coordinates[1];

        var eightCellsAround = [
            [x - 1, y - 1],
            [x - 1, y],
            [x - 1, y + 1],
            [x, y - 1],
            [x, y + 1],
            [x + 1, y - 1],
            [x + 1, y],
            [x + 1, y + 1]
        ];

        return _.filter(eightCellsAround, function (pos) {
            return pos[0] >= 0 && pos[1] >= 0 && pos[0] < fieldWidth && pos[1] < fieldHeight;
        });
    },

    _placeNumbers: function (field) {
        var nonMineCells = _.filter(field.coordinates, function (c) {
            return field.data[c].symbol != minesweeper.constants.bomb;
        });

        _.each(nonMineCells, function (c) {
            var neighbors = minesweeper._neighbors(c, field.width, field.height);
            var neighboringMines = _.filter(neighbors, function (n) {
                return field.data[n].symbol == minesweeper.constants.bomb;
            });

            var countOfMines = neighboringMines.length;

            field.data[c].symbol = countOfMines == 0 ? minesweeper.constants.empty : countOfMines;
        });

        return field;
    },

    generateField: function (width, height, mines) {
        var field = {
            width: width,
            height: height,
            mines: mines,
            coordinates: minesweeper._getFieldCoordinates(width, height),
            data: {}
        };

        field = minesweeper._placeMines(field);
        field = minesweeper._placeNumbers(field);


        return field;
    }
};


var Cell = React.createClass({
    handleClick: function (e) {
        e.preventDefault();

        this.props.onCellClick({
            coordinates: this.props.coordinates,
            button: e.button
        });
    },

    render: function () {
        return React.DOM.div({
            className: "field-cell",
            onMouseDown: this.handleClick
        }, this.props.value.symbol);
    }
});


var Field = React.createClass({
    handleClick: function (e) {
        this.props.onCellClick(e);
    },

    render: function () {
        var field = this.props.field;
        var clickEvent = this.handleClick;

        return React.DOM.div({className: "field"},
            _.map(_.range(field.width), function (i) {
                return React.DOM.div({className: "field-row"},
                    _.map(_.range(field.height), function (j) {
                        return Cell({
                            coordinates: [i, j],
                            value: field.data[[i, j]],
                            onCellClick: clickEvent
                        })
                    }));
            }));
    }
});


var Game = React.createClass({
    handleClick: function (e) {
        console.log("in game");
        console.log(e);
    },

    getInitialState: function () {
        return {
            field: minesweeper.generateField(this.props.width, this.props.height, this.props.mines)
        }
    },

    render: function () {
        return React.DOM.div(null, Field({field: this.state.field, onCellClick: this.handleClick}));
    }
});


React.renderComponent(Game({width: 9, height: 9, mines: 10}), document.getElementById("game"));

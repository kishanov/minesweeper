'use strict';


var minesweeper = {
    CellValueEnum: {
        EMPTY: '\u00A0',
        MINE: '\u2620',
        FLAG: '\u2691'
    },


    CellStateEnum: {
        CLOSED: 0,
        MARKED: 1,
        OPEN: 2
    },

    GameStatusEnum: {
        IN_PROGRESS: 0,
        LOST: 1,
        WON: 2
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

    _neighbors: function (coordinate, fieldWidth, fieldHeight) {
        var x = coordinate[0];
        var y = coordinate[1];

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

    _emptyNeighbors: function (coordinate, field) {
        return _.filter(minesweeper._neighbors(coordinate, field.width, field.height), function (c) {
            return field.data[c].symbol == minesweeper.CellValueEnum.EMPTY;
        });
    },

    _bfs: function (field, start) {
        var levels = {};
        var level = 0;
        var vertices = [];
        var frontier = [start];

        while (frontier.length > 0) {
            var next = [];

            _.each(frontier, function (node) {
                vertices.push(node);
                levels[node] = level;

                var neighbors = minesweeper._emptyNeighbors(node, field);

                _.each(neighbors, function (adj) {
                    if (!_.has(levels, adj)) {
                        next.push(adj);
                    }
                });

            });

            frontier = next;
            level += 1;
        }

        return vertices;
    },

    revealReachableEmptyCells: function (field, coordinate) {
        var reachableEmptyCells = minesweeper._bfs(field, coordinate);

        _.each(reachableEmptyCells, function (c) {
            field.data[c].state = minesweeper.CellStateEnum.OPEN;
        });

        return field;
    },

    revealAllMines: function (field) {
        _.each(field.coordinates, function (c) {
            if (field.data[c].symbol == minesweeper.CellValueEnum.MINE) {
                field.data[c].state = minesweeper.CellStateEnum.OPEN;
            }
        });

        return field;
    },

    _placeMines: function (field) {
        var coordinates = _.shuffle(field.coordinates);
        var minesCounter = field.mines;

        _.each(coordinates, function (coordinate) {
            field.data[coordinate] = {
                symbol: minesCounter > 0 ? minesweeper.CellValueEnum.MINE : minesweeper.CellValueEnum.EMPTY,
                state: minesweeper.CellStateEnum.CLOSED
            };
            minesCounter--;
        });

        return field;
    },

    _placeNumbers: function (field) {
        var nonMineCells = _.filter(field.coordinates, function (c) {
            return field.data[c].symbol != minesweeper.CellValueEnum.MINE;
        });

        _.each(nonMineCells, function (c) {
            var neighbors = minesweeper._neighbors(c, field.width, field.height);
            var neighboringMines = _.filter(neighbors, function (n) {
                return field.data[n].symbol == minesweeper.CellValueEnum.MINE;
            });

            var countOfMines = neighboringMines.length;

            field.data[c].symbol = countOfMines == 0 ? minesweeper.CellValueEnum.EMPTY : countOfMines;
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
        var cx = React.addons.classSet;
        var css = {
            'field-cell': true,
            'field-cell-opened': this.props.value.state == minesweeper.CellStateEnum.OPEN,
        };

        if (!isNaN(this.props.value.symbol)) {
            css["mines" + this.props.value.symbol.toString()] = true;
        }

        var symb = this.props.value.state == minesweeper.CellStateEnum.OPEN ? this.props.value.symbol : minesweeper.CellValueEnum.EMPTY;


        return React.DOM.div({
            className: cx(css),
            onMouseDown: this.handleClick
        }, symb);
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
        if (this.state.field.data[e.coordinates].state == minesweeper.CellStateEnum.CLOSED && this.state.gameStatus == minesweeper.GameStatusEnum.IN_PROGRESS) {
            var fieldAfterClick = _.cloneDeep(this.state.field);
            var gameStatusAfterClick = this.state.gameStatus;

            switch (this.state.field.data[e.coordinates].symbol) {
                case minesweeper.CellValueEnum.EMPTY:
                    fieldAfterClick = minesweeper.revealReachableEmptyCells(fieldAfterClick, e.coordinates);
                    break;

                case minesweeper.CellValueEnum.MINE:
                    gameStatusAfterClick = minesweeper.GameStatusEnum.LOST;
                    fieldAfterClick = minesweeper.revealAllMines(fieldAfterClick);

                    break;

                default:
                    fieldAfterClick.data[e.coordinates].state = minesweeper.CellStateEnum.OPEN;
            }


            this.setState({
                field: fieldAfterClick,
                gameStatus: gameStatusAfterClick
            });
        }
    },

    getInitialState: function () {
        return {
            field: minesweeper.generateField(this.props.width, this.props.height, this.props.mines),
            gameStatus: minesweeper.GameStatusEnum.IN_PROGRESS
        }
    },

    render: function () {
        return React.DOM.div(null, Field({field: this.state.field, onCellClick: this.handleClick}));
    }
});


React.renderComponent(Game({width: 9, height: 9, mines: 10}), document.getElementById("game"));
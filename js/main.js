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


    generateField: function (width, height, mines) {
        var field = { width: width, height: height, mines: mines, data: {}};
        var coords = [];
        var minesCounter = mines;

        _.each(_.range(width), function (x) {
            _.each(_.range(height), function (y) {
                coords.push([x, y]);
            });
        });

        coords = _.shuffle(coords);

        _.each(coords, function (pos) {
            field.data[pos] = {
                symbol: minesCounter > 0 ? minesweeper.constants.bomb : minesweeper.constants.empty,
                cellState: minesweeper.CellStates.CLOSED
            };
            minesCounter--;
        });


        return field;
    }
};


var Cell = React.createClass({
    render: function () {
        return React.DOM.div({className: "field-cell"}, this.props.v.symbol);
    }
});


var Field = React.createClass({
    render: function () {
        var field = this.props.field;

        return React.DOM.div({className: "field"},
            _.map(_.range(field.width), function (i) {
                return React.DOM.div({className: "field-row"},
                    _.map(_.range(field.height), function (j) {
                        return Cell({
                            x: i,
                            y: j,
                            v: field.data[[i, j]]
                        })
                    }));
            }));
    }
});


var Game = React.createClass({
    getInitialState: function () {
        return {
            field: minesweeper.generateField(this.props.width, this.props.height, this.props.mines)
        }
    },

    render: function () {
        console.log(this.state);
        return React.DOM.div(null, Field({field: this.state.field}));
    }
});


React.renderComponent(Game({width: 9, height: 9, mines: 10}), document.getElementById("game"));

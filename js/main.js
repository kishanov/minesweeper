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


    generateField: function (width, height) {
        return _.map(_.range(width), function (x) {
            return _.map(_.range(height), function (y) {
                return {
                    symbol: minesweeper.constants.flag,
                    cellState: minesweeper.CellStates.CLOSED
                };
            });
        });
    }
};


var Cell = React.createClass({
    render: function () {
        return React.DOM.div({className: "field-cell"}, this.props.v.symbol);
    }
});


var Field = React.createClass({
    render: function () {
        var fieldData = this.props.fieldData;
        var width = fieldData.length;
        var height = fieldData[0].length;

        return React.DOM.div({className: "field"},
            _.map(_.range(width), function (i) {
                return React.DOM.div({className: "field-row"},
                    _.map(_.range(height), function (j) {
                        return Cell({
                            x: i,
                            y: j,
                            v: fieldData[i][j]
                        })
                    }));
            }));
    }
});


var Game = React.createClass({
    getInitialState: function () {
        return {
            field: minesweeper.generateField(this.props.width, this.props.height)
        }
    },

    render: function () {
        console.log(this.state);
        return React.DOM.div(null, Field({fieldData: this.state.field}));
    }
});


React.renderComponent(Game({width: 9, height: 9, mines: 10}), document.getElementById("game"));

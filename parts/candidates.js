'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reselect = require('reselect');

var _reactRedux = require('react-redux');

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

var _lodash = require('lodash');

var _reactVirtualized = require('react-virtualized');

var _reactBootstrap = require('react-bootstrap');

var _reactFontawesome = require('react-fontawesome');

var _reactFontawesome2 = _interopRequireDefault(_reactFontawesome);

var _chromaJs = require('chroma-js');

var _chromaJs2 = _interopRequireDefault(_chromaJs);

var _selectors = require('views/utils/selectors');

var _tools = require('views/utils/tools');

var _functions = require('./functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { i18n } = window;
const __ = i18n['poi-plugin-milk'].__.bind(i18n['poi-plugin-milk']);

const sortable = ['HP', 'Akashi Time', 'Per HP'];

const getSortValue = sortIndex => ship => {
  const direction = sortIndex % 2 ? -1 : 1;

  switch (parseInt(sortIndex / 2, 10)) {
    case 0:
      return ship.api_nowhp / ship.api_maxhp * direction;
    case 1:
      return ship.akashi * direction;
    case 2:
      return ship.perHP * direction;
    default:
      return ship.api_id;
  }
};

const allFleetShipIdSelector = (0, _reselect.createSelector)([...[...new Array(4).keys()].map(fleetId => (0, _selectors.fleetShipsIdSelectorFactory)(fleetId))], (id1, id2, id3, id4) => [id1, id2, id3, id4]);

const shipFleetIdMapSelector = (0, _reselect.createSelector)([state => state.info.ships, allFleetShipIdSelector], (ships, fleetIds) => (0, _lodash.mapValues)(ships, ship => (0, _lodash.findIndex)(fleetIds, fleetId => (0, _lodash.includes)(fleetId, ship.api_id))));

const repairIdSelector = (0, _reselect.createSelector)([_selectors.repairsSelector], repair => (0, _lodash.map)(repair, dock => dock.api_ship_id));

const candidateShipsSelector = sortIndex => (0, _reselect.createSelector)([state => state.info.ships, state => state.const.$ships, shipFleetIdMapSelector, repairIdSelector], (ships, $ships, shipFleetIdMap, repairIds) => _fp2.default.flow(_fp2.default.filter(ship => (0, _functions.akashiEstimate)(ship) > 0 && !(0, _lodash.includes)(repairIds, ship.api_id)), _fp2.default.map(ship => _extends({}, $ships[ship.api_ship_id], ship, {
  akashi: (0, _functions.akashiEstimate)(ship),
  perHP: (0, _functions.timePerHPCalc)(ship),
  fleetId: shipFleetIdMap[ship.api_id]
})), _fp2.default.sortBy(ship => getSortValue(sortIndex)(ship)))(ships));

const getHPBackgroundColor = (nowhp, maxhp) => {
  const percentage = nowhp / maxhp;
  return percentage > 0.75 ? _chromaJs2.default.mix('rgb(253, 216, 53)', 'rgb(67, 160, 71)', (percentage - 0.75) / 0.25, 'lab').alpha(0.6).css() : _chromaJs2.default.mix('rgb(245, 124, 0)', 'rgb(253, 216, 53)', (percentage - 0.5) / 0.25, 'lab').alpha(0.6).css();
};

// console.log(
//   chroma.mix('rgb(253, 216, 53)', 'rgb(67, 160, 71)', 0.5, 'lch').alpha(0.6).css(),
//   chroma.mix('rgb(253, 216, 53)', 'rgb(67, 160, 71)', 0.5, 'rgb').alpha(0.6).css(),
//   chroma.mix('rgb(253, 216, 53)', 'rgb(67, 160, 71)', 0.5, 'hsl').alpha(0.6).css(),
//   chroma.mix('rgb(253, 216, 53)', 'rgb(67, 160, 71)', 0.5, 'lab').alpha(0.6).css(),
// )
// (nowhp / maxhp) > 0.75 ? 'rgba(67, 160, 71, 0.6)' : 'rgba(253, 216, 53, 0.6)'

const Candidates = (0, _reactRedux.connect)((state, { sortIndex = 0 }) => ({
  ships: candidateShipsSelector(sortIndex)(state)
}))(class Candidates extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.rowRenderer = ({ key, index, style }) => {
      const { ships } = this.props;
      const ship = ships[index];
      const color = getHPBackgroundColor(ship.api_nowhp, ship.api_maxhp);
      const percentage = Math.round(100 * ship.api_nowhp / ship.api_maxhp);
      return _react2.default.createElement(
        'div',
        {
          className: 'candidate-ship-item',
          style: _extends({}, style, {
            background: `linear-gradient(90deg, ${color} ${percentage}%, rgba(0, 0, 0, 0) 50%)`
          }),
          key: key
        },
        _react2.default.createElement(
          'span',
          { className: 'ship-name' },
          `Lv.${ship.api_lv} ${window.i18n.resources.__(ship.api_name)}${ship.fleetId < 0 ? '' : `/${ship.fleetId + 1}`}`
        ),
        _react2.default.createElement(
          'span',
          { style: { marginLeft: '1em' } },
          `(${ship.api_nowhp} / ${ship.api_maxhp})`
        ),
        _react2.default.createElement(
          'span',
          { style: { marginLeft: '2em' } },
          `${(0, _tools.resolveTime)(ship.akashi / 1000)} / ${(0, _tools.resolveTime)(ship.perHP / 1000)}`
        )
      );
    }, _temp;
  }

  render() {
    const { ships, sortIndex } = this.props;
    return _react2.default.createElement(
      'div',
      {
        id: 'candidate-list'
      },
      _react2.default.createElement(
        'div',
        { style: { marginBottom: '1ex' } },
        _react2.default.createElement(
          _reactBootstrap.ButtonGroup,
          { bsSize: 'small' },
          [...new Array(6).keys()].map(index => _react2.default.createElement(
            _reactBootstrap.Button,
            {
              key: index,
              onClick: this.props.handleSort(index),
              bsStyle: index === sortIndex ? 'success' : 'default'
            },
            __(sortable[parseInt(index / 2, 10)]),
            _react2.default.createElement(_reactFontawesome2.default, { name: index % 2 === 0 ? 'arrow-up' : 'arrow-down' })
          ))
        )
      ),
      _react2.default.createElement(
        _reactVirtualized.AutoSizer,
        null,
        ({ height, width }) => _react2.default.createElement(_reactVirtualized.List, {
          sortIndex: sortIndex,
          height: height,
          width: width,
          rowHeight: 40,
          rowCount: ships.length,
          rowRenderer: this.rowRenderer
        })
      )
    );
  }
});

exports.default = Candidates;
module.exports = exports['default'];
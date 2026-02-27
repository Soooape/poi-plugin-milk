'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _class, _temp;
// import { createSelector  } from 'reselect'


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _reactBootstrap = require('react-bootstrap');

var _reactFontawesome = require('react-fontawesome');

var _reactFontawesome2 = _interopRequireDefault(_reactFontawesome);

var _tools = require('views/utils/tools');

var _countdownTimer = require('views/components/main/parts/countdown-timer');

var _functions = require('./functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const constShipsSelector = createSelector(
//   constSelector,
//   (_const) => _.keyBy(_const.$ships, 'api_id')
// )

const { ROOT, i18n } = window;
const __ = i18n['poi-plugin-milk'].__.bind(i18n['poi-plugin-milk']);

const ShipRow = (0, _reactRedux.connect)(state => {
  const canNotify = state.misc.canNotify;
  return {
    canNotify
  };
})((_temp = _class = class ShipRowClass extends _react.Component {

  render() {
    const { timeElapsed, timeElapsedMilk, lastRefresh, canRepair, ship, canNotify, canMilk, nosakiNoKai } = this.props;
    const { api_nowhp, api_maxhp, availableSRF, estimate, timePerHP,
      api_id, api_lv, inRepair, api_name, api_cond, canReceiveMilk } = ship;
    //console.log(ship)
    const completeTime = lastRefresh + estimate;
    var milkadd = 0;
    var milkElapsed = timeElapsedMilk != null ? timeElapsedMilk : timeElapsed;
    if (canMilk && canReceiveMilk) {
      if (nosakiNoKai) {
        milkadd = Math.floor(milkElapsed / 900) * 2;
      } else {
        milkadd = Math.floor(milkElapsed / 900) * 3;
      }
    }
    var milks = Math.max(api_cond,Math.min(api_cond + milkadd,54))

    return _react2.default.createElement(
      'tr',
      null,
      _react2.default.createElement(
        'td',
        null,
        i18n.resources.__(api_name),
        _react2.default.createElement(
          'span',
          { className: 'lv-label' },
          'Lv.',
          api_lv
        )
      ),
      _react2.default.createElement(
        'td',
        null,
        _react2.default.createElement(
          _reactBootstrap.Label,
          { bsStyle: (0, _functions.getHPLabelStyle)(api_nowhp, api_maxhp, availableSRF, inRepair) },
          `${api_nowhp} / ${api_maxhp}`
        ),
        _react2.default.createElement(
          'span',
          null,
          '🙂',
          api_cond
        )
      ),
      _react2.default.createElement(
        'td',
        null,
        estimate > 0 && canRepair && availableSRF && (!inRepair ? _react2.default.createElement(_countdownTimer.CountdownNotifierLabel, {
          timerKey: `anchorage-ship-${api_id}`,
          completeTime: completeTime,
          getLabelStyle: _functions.getCountdownLabelStyle,
          getNotifyOptions: () => canNotify && lastRefresh > 0 && _extends({}, this.constructor.basicNotifyConfig, {
            completeTime,
            args: i18n.resources.__(api_name)
          })
        }) : inRepair ? _react2.default.createElement(
          _reactBootstrap.Label,
          { bsStyle: 'success' },
          _react2.default.createElement(_reactFontawesome2.default, { name: 'wrench' }),
          ' ',
          __('Docking')
        ) : '')
      ),
      _react2.default.createElement(
        'td',
        null,
        timePerHP ? (0, _tools.resolveTime)(timePerHP / 1000) : ''
      ),
      _react2.default.createElement(
        'td',
        null,
        canRepair ? '❤️' : null,
        canRepair && api_nowhp !== api_maxhp && !inRepair && (0, _functions.repairEstimate)(ship, timeElapsed, availableSRF),
        canMilk && canReceiveMilk ? _react2.default.createElement(
          'span',
          null,
          '🙂',
          milks
        ) : null
      )
    );
  }
}, _class.basicNotifyConfig = {
  type: 'repair',
  title: __('Anchorage repair'),
  message: names => `${_lodash2.default.join(names, ', ')} ${__('anchorage repair completed')}`,
  icon: (0, _path.join)(ROOT, 'assets', 'img', 'operation', 'repair.png'),
  preemptTime: 0,
  groupKey: 'plugin-anchorage-repair'
}, _class.propTypes = {
  canNotify: _propTypes2.default.bool.isRequired,
  timeElapsed: _propTypes2.default.number.isRequired,
  timeElapsedMilk: _propTypes2.default.number,
  lastRefresh: _propTypes2.default.number.isRequired,
  ship: _propTypes2.default.object.isRequired,
  canRepair: _propTypes2.default.bool.isRequired,
  canMilk: _propTypes2.default.bool,
  nosakiNoKai: _propTypes2.default.bool
}, _temp));

exports.default = ShipRow;
module.exports = exports['default'];
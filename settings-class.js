'use strict';

var _react = require('react');
var _react2 = _interopRequireDefault(_react);
var _reactRedux = require('react-redux');
var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONFIG_OPEN_MAIN_TIMER = 'plugin.milk.openMainTimerOnStart';
const CONFIG_OPEN_15MIN_REMINDER = 'plugin.milk.openFifteenMinuteReminderOnStart';

const CheckboxItem = (0, _reactRedux.connect)((state, props) => ({
  value: _lodash.get(state.config, props.configName, props.defaultVal),
  configName: props.configName,
  label: props.label
}))(class CheckboxItem extends _react.Component {
  handleChange() {
    const { configName, value } = this.props;
    config.set(configName, !value);
  }
  render() {
    const { value, label } = this.props;
    return _react2.default.createElement(
      'div',
      { style: { paddingRight: '2em', marginBottom: '0.5em' } },
      _react2.default.createElement(
        'label',
        { style: { cursor: 'pointer', fontWeight: 'normal' } },
        _react2.default.createElement('input', {
          type: 'checkbox',
          checked: value,
          onChange: () => this.handleChange()
        }),
        ' ',
        label
      )
    );
  }
});

const SettingsClass = (0, _reactRedux.connect)((state) => ({
  openMainTimerOnStart: _lodash.get(state.config, CONFIG_OPEN_MAIN_TIMER, false),
  openFifteenMinuteReminderOnStart: _lodash.get(state.config, CONFIG_OPEN_15MIN_REMINDER, false)
}))(class SettingsClass extends _react.Component {
  render() {
    return _react2.default.createElement(
      'div',
      { style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' } },
      _react2.default.createElement(CheckboxItem, {
        label: '启动时打开主面板计时',
        configName: CONFIG_OPEN_MAIN_TIMER,
        defaultVal: false
      }),
      _react2.default.createElement(CheckboxItem, {
        label: '启动时打开15分钟提醒',
        configName: CONFIG_OPEN_15MIN_REMINDER,
        defaultVal: false
      })
    );
  }
});

module.exports = SettingsClass;

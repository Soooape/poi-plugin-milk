'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactBootstrap = require('react-bootstrap');

var _countupTimer = require('./countup-timer');

var _countupTimer2 = _interopRequireDefault(_countupTimer);

var _functions = require('./functions');

var _shipRow = require('./ship-row');

var _shipRow2 = _interopRequireDefault(_shipRow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { i18n } = window;
const __ = i18n['poi-plugin-milk'].__.bind(i18n['poi-plugin-milk']);

class FleetList extends _react.Component {

  constructor(props) {
    super(props);

    this.componentDidMount = () => {
      window.addEventListener('game.response', this.handleResponse);
    };

    this.componentWillUnmount = () => {
      window.removeEventListener('game.response', this.handleResponse);
    };



    this.handleResponse = e => {
      const { path, postBody } = e.detail;
      const { timeElapsed, timeElapsedMilk, lastRefresh, lastRefreshMilk } = this.state;
      const needtimeRepair = _functions.AKASHI_INTERVAL / 1000;
      const needtimeMilk = 900;
      switch (path) {
        case '/kcsapi/api_port/port': {
          const { fleet } = this.props;
          const now = Date.now();
          const actualElapsedRepair = lastRefresh > 0 ? Math.round((now - lastRefresh) / 1000) : 0;
          const actualElapsedMilk = lastRefreshMilk > 0 ? Math.round((now - lastRefreshMilk) / 1000) : 0;
          const updates = {};
          if (lastRefresh === 0) {
            updates.lastRefresh = now;
          } else if (fleet.canRepair && actualElapsedRepair >= needtimeRepair) {
            updates.lastRefresh = now;
          }
          if (lastRefreshMilk === 0) {
            updates.lastRefreshMilk = now;
          } else if (fleet.canMilk && actualElapsedMilk >= needtimeMilk) {
            updates.lastRefreshMilk = now;
          }
          if (Object.keys(updates).length > 0) {
            this.setState(updates);
          }
          break;
        }

        case '/kcsapi/api_req_hensei/preset_select':
          {
            const { fleet} = this.props;

            var oldCanRepair = _functions.getCanRepair(fleet);

            var changeFleetId = parseInt(postBody.api_deck_id, 10);
            if(!Number.isNaN(changeFleetId)&&changeFleetId==this.props.fleet.api_id){
              //console.log(fleet);
              var newFleet = getStore('info.fleets')[changeFleetId-1];
              var newCanRepair = _functions.getCanRepair(newFleet);
              // console.log(3333333333)
              // console.log(oldCanRepair,newCanRepair);
              var key = 'cr_'+changeFleetId

            }

          }
          break;
        case '/kcsapi/api_req_hensei/change':
          {

            const { fleet } = this.props;
            const needtimeRepair = _functions.AKASHI_INTERVAL / 1000;
            const needtimeMilk = 900;
            const { timeElapsed, timeElapsedMilk } = this.state;

            const fleetId = parseInt(postBody.api_id, 10);
            const shipId = parseInt(postBody.api_ship_id, 10);
            if (!Number.isNaN(fleetId) && fleetId === this.props.fleet.api_id && shipId >= 0) {
              var newFleet = getStore('info.fleets')[fleetId - 1];
              var newCanRepair = newFleet ? _functions.getCanRepair(newFleet) : false;
              var newCanMilk = newFleet ? _functions.getCanMilk(newFleet) : false;

              if (timeElapsed < needtimeRepair && timeElapsedMilk < needtimeMilk) {
                const updates = {};
                if (newCanRepair) updates.lastRefresh = Date.now();
                if (newCanMilk) updates.lastRefreshMilk = Date.now();
                if (!fleet.canRepair && !newCanRepair && !newCanMilk) {
                  this.setState({ lc: newCanRepair });
                } else if (Object.keys(updates).length > 0) {
                  this.setState(updates);
                }
              } else if (shipId < 0) {
                this.setState({});
              } else {
                this.setState({
                  lastRefresh: 0,
                  lastRefreshMilk: 0
                });
              }
            }
            break;
          }
        case '/kcsapi/api_req_nyukyo/start':
          {
            const shipId = parseInt(postBody.api_ship_id, 10);
            const infleet = _lodash2.default.filter(this.props.fleet.shipId, id => shipId === id);
            if (postBody.api_highspeed === 1 && infleet != null) {
              this.setState({ lastRefresh: Date.now(), lastRefreshMilk: Date.now() });
            }
            break;
          }
        default:
      }
    };

    this.tick = timeElapsed => {
      if (timeElapsed % 5 === 0) {
        this.setState({ timeElapsed });
      }
    };
    this.tickMilk = timeElapsedMilk => {
      if (timeElapsedMilk % 5 === 0) {
        this.setState({ timeElapsedMilk });
      }
    };

    this.resetTimeElapsed = () => {
      this.setState({ timeElapsed: 0 });
    };
    this.resetTimeElapsedMilk = () => {
      this.setState({ timeElapsedMilk: 0 });
    };

    this.state = {
      lastRefresh: 0,
      timeElapsed: 0,
      lastRefreshMilk: 0,
      timeElapsedMilk: 0
    };
  }

  render() {
    const { timeElapsed, timeElapsedMilk, lastRefresh, lastRefreshMilk } = this.state;
    const { fleet } = this.props;

    var s1 = '';
    if (!fleet.canRepair) {
      s1 = __('Repair not ready');
    } else {
      s1 = __('Repairing');
    }
    var s2 = '';
    if (!fleet.canMilk) {
      s2 = __('Milk not ready');
    } else {
      s2 = __('Feeding');
    }
    var lc = this.state.lc;


    return _react2.default.createElement(
      _reactBootstrap.Grid,
      null,
      _react2.default.createElement(
        _reactBootstrap.Row,
        { className: 'info-row' },
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 4, className: 'info-col' },
          _react2.default.createElement(
            _reactBootstrap.OverlayTrigger,
            {
              placement: 'bottom',
              trigger: fleet.canRepair ? 'click' : ['hover', 'focus'],
              overlay: _react2.default.createElement(
                _reactBootstrap.Tooltip,
                { id: `anchorage-refresh-notify-${fleet.api_id}` },
                _react2.default.createElement(
                  'p',
                  null,
                  fleet.canRepair ? __('Akashi loves you!') : ''
                ),
                _react2.default.createElement(
                  'p',
                  null,
                  fleet.akashiFlagship ? '' : __('Akashi not flagship')
                ),
                _react2.default.createElement(
                  'p',
                  null,
                  fleet.inExpedition ? __('fleet in expedition') : ''
                ),
                _react2.default.createElement(
                  'p',
                  null,
                  fleet.flagShipInRepair ? __('flagship in dock') : ''
                )
              )
            },
            _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: fleet.canRepair ? 'success' : 'warning' },
              s1
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 4, className: 'info-col' },
            _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: fleet.canRepair ? 'success' : 'warning' },
            _react2.default.createElement(
              'span',
              null,
              __('Elapsed:'),
              ' '
            ),
            _react2.default.createElement(_countupTimer2.default, {
              countdownId: 'repair-' + fleet.api_id,
              startTime: this.state.lastRefresh,
              showMain: this.props.showm,
              aler: this.props.aler,
              tickCallback: this.tick,
              startCallback: this.resetTimeElapsed
            })
          )
        ),

        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 4, className: 'info-col' },
          _react2.default.createElement(
            _reactBootstrap.Label,
            { bsStyle: fleet.repairCount ? 'success' : 'warning' },
            __('Capacity: %s', fleet.repairCount)
          )
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.Row,
        { className: 'info-row' },
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 4, className: 'info-col' },
          _react2.default.createElement(
            _reactBootstrap.OverlayTrigger,
            {
              placement: 'bottom',
              trigger: fleet.canMilk ? 'click' : ['hover', 'focus'],
              overlay: _react2.default.createElement(
                _reactBootstrap.Tooltip,
                { id: `anchorage-milk-notify-${fleet.api_id}` },
                fleet.canMilk ? _react2.default.createElement('p', null, __('Nosaki loves you!')) : null,
                fleet.nosakiShip == null
                  ? _react2.default.createElement('p', null, __('Nosaki not found'))
                  : _react2.default.createElement(
                    'span',
                    null,
                    !fleet.nosakiInPosition ? _react2.default.createElement('p', null, __('Nosaki not in position')) : null,
                    !fleet.nosakiFullSupply ? _react2.default.createElement('p', null, __('Nosaki needs resupply')) : null,
                    fleet.nosakiDamaged ? _react2.default.createElement('p', null, __('Nosaki damaged')) : null,
                    (fleet.nosakiCondition == null || fleet.nosakiCondition < 30) ? _react2.default.createElement('p', null, __('Nosaki low morale')) : null,
                    fleet.nosakiInRepair ? _react2.default.createElement('p', null, __('Nosaki in dock')) : null
                  )
              )
            },
            _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: fleet.canMilk ? 'success' : 'warning' },
              s2
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 4, className: 'info-col' },
          _react2.default.createElement(
            _reactBootstrap.Label,
            { bsStyle: fleet.canMilk ? 'success' : 'warning' },
            _react2.default.createElement(
              'span',
              null,
              __('Elapsed:'),
              ' '
            ),
            _react2.default.createElement(_countupTimer2.default, {
              countdownId: 'milk-' + fleet.api_id,
              startTime: this.state.lastRefreshMilk,
              showMain: this.props.showm,
              aler: this.props.aler,
              tickCallback: this.tickMilk,
              startCallback: this.resetTimeElapsedMilk
            })
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 4, className: 'info-col' },
          null
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.Row,
        null,
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 12 },
          _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'warning', className: lastRefresh === 0 || lastRefreshMilk === 0 ? '' : 'hidden' },
            __('Please return to HQ screen to make timer refreshed.')
          )
        )
      ),
      _react2.default.createElement(
        _reactBootstrap.Row,
        null,
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 12 },
          _react2.default.createElement(
            _reactBootstrap.Table,
            { bordered: true, condensed: true },
            _react2.default.createElement(
              'thead',
              null,
              _react2.default.createElement(
                'tr',
                null,
                _react2.default.createElement(
                  'th',
                  null,
                  __('Ship')
                ),
                _react2.default.createElement(
                  'th',
                  null,
                  __('HP')
                ),
                _react2.default.createElement(
                  'th',
                  null,
                  _react2.default.createElement(
                    _reactBootstrap.OverlayTrigger,
                    {
                      placement: 'top',
                      overlay: _react2.default.createElement(
                        _reactBootstrap.Tooltip,
                        { id: 'akashi-time-desc' },
                        __('Total time required')
                      )
                    },
                    _react2.default.createElement(
                      'span',
                      null,
                      __('Akashi Time')
                    )
                  )
                ),
                _react2.default.createElement(
                  'th',
                  null,
                  _react2.default.createElement(
                    _reactBootstrap.OverlayTrigger,
                    {
                      placement: 'top',
                      overlay: _react2.default.createElement(
                        _reactBootstrap.Tooltip,
                        { id: 'akashi-time-desc' },
                        __('Time required for 1 HP recovery')
                      )
                    },
                    _react2.default.createElement(
                      'span',
                      null,
                      __('Per HP')
                    )
                  )
                ),
                _react2.default.createElement(
                  'th',
                  null,
                  _react2.default.createElement(
                    _reactBootstrap.OverlayTrigger,
                    {
                      placement: 'top',
                      overlay: _react2.default.createElement(
                        _reactBootstrap.Tooltip,
                        { id: 'akashi-time-desc' },
                        __('Estimated HP recovery since last refresh')
                      )
                    },
                    _react2.default.createElement(
                      'span',
                      null,
                      __('Estimated repaired')
                    )
                  )
                )
              )
            ),
            _react2.default.createElement(
              'tbody',
              null,
              _lodash2.default.map(fleet.repairDetail, ship => _react2.default.createElement(_shipRow2.default, {
                key: `anchorage-ship-${ship.api_id}`,
                ship: ship,
                lastRefresh: lastRefresh,
                timeElapsed: timeElapsed,
                timeElapsedMilk: timeElapsedMilk,
                canRepair: fleet.canRepair,
                canMilk: fleet.canMilk,
                nosakiNoKai: fleet.nosakiNoKai
              }))
            )
          )
        )
      )
    );
  }
}
exports.default = FleetList;
FleetList.propTypes = {
  fleet: _propTypes2.default.object.isRequired
};
module.exports = exports['default'];
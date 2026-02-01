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
      const { timeElapsed, lastRefresh } = this.state;
      switch (path) {
        case '/kcsapi/api_port/port':

          const { fleet } = this.props;
          var needtime = 900;
          if(fleet.canRepair==0){
            needtime = 900;
          }else if(fleet.canRepair==1){
            needtime = _functions.AKASHI_INTERVAL / 1000;
          }else if(fleet.canRepair==2||fleet.canRepair==3){
            needtime = 900;
          }else if(fleet.canRepair==4||fleet.canRepair==5){
            needtime = 900;
          }

          if (timeElapsed >= needtime || lastRefresh === 0) {
            this.setState({
              lastRefresh: Date.now(),
              timeElapsed: 0
            });
          }
          break;

        case '/kcsapi/api_req_hensei/preset_select':
          {
            const { fleet} = this.props;

            var oldCanRepair = _functions.getCanRepairStatus(fleet);

            var changeFleetId = parseInt(postBody.api_deck_id, 10);
            if(!Number.isNaN(changeFleetId)&&changeFleetId==this.props.fleet.api_id){
              //console.log(fleet);
              var newFleet = getStore('info.fleets')[changeFleetId-1];
              var newCanRepair = _functions.getCanRepairStatus(newFleet);
              // console.log(3333333333)
              // console.log(oldCanRepair,newCanRepair);
              var key = 'cr_'+changeFleetId

            }

          }
          break;
        case '/kcsapi/api_req_hensei/change':
          {


            const { fleet} = this.props;
            var needtime = 900;
            if(fleet.canRepair==0){
              needtime = 900;
            }else if(fleet.canRepair==1){
              needtime = _functions.AKASHI_INTERVAL / 1000;
            }else if(fleet.canRepair==2||fleet.canRepair==3){
              needtime = 900;
            }else if(fleet.canRepair==4||fleet.canRepair==5){
              needtime = 900;
            }


            const fleetId = parseInt(postBody.api_id, 10);
            const shipId = parseInt(postBody.api_ship_id, 10
            // const shipIndex = parseInt(postBody.api_ship_idx)
            );if (!Number.isNaN(fleetId) && fleetId === this.props.fleet.api_id && shipId >= 0) {
              if (timeElapsed < needtime) {
                var newFleet = getStore('info.fleets')[fleetId-1];
                var newCanRepair = 0;
                if(newFleet){
                  var flagshipa = _lodash2.default.get(newFleet, 'api_ship.0', -1)
                  var secondshipa = _lodash2.default.get(newFleet, 'api_ship.1', -1)
                  var flagshipid = _ships[flagshipa]?_ships[flagshipa].api_ship_id:-1;
                  var secondshipid = _ships[secondshipa]?_ships[secondshipa].api_ship_id:-1;
                  if(flagshipid==182||flagshipid==187){
                    newCanRepair = 1
                  }else if (flagshipid==996||secondshipid==996){
                    newCanRepair = 2
                  }else if (flagshipid==1002||secondshipid==1002){
                    newCanRepair = 3
                  }else if (flagshipid==182||flagshipid==187&&secondshipid==996){
                    newCanRepair = 4
                  }else if (flagshipid==182||flagshipid==187&&secondshipid==1002){
                    newCanRepair = 5
                  }else{
                    newCanRepair = 0
                  }
                }
                if(fleet.canRepair==0&&newCanRepair==0){
                  this.setState({
                    lc:newCanRepair
                  });
                }else{
                  this.setState({
                    lastRefresh: Date.now(),
                    timeElapsed: 0,
                    lc:newCanRepair
                  });
                }
              } else if (shipId < 0) {
                this.setState({
                  lc:newCanRepair
                });
              } else {
                this.setState({ // since it has passed more than 20 minutes, need to refresh the hp
                  lastRefresh: 0,
                  lc:newCanRepair
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
              this.setState({ lastRefresh: Date.now() });
            }
            break;
          }
        default:
      }
    };

    this.tick = timeElapsed => {
      if (timeElapsed % 5 === 0) {
        // limit component refresh rate
        this.setState({ timeElapsed });
      }
    };

    this.resetTimeElapsed = () => {
      this.setState({ timeElapsed: 0 });
    };

    this.state = {
      lastRefresh: 0,
      timeElapsed: 0
    };
  }

  render() {
    const { timeElapsed, lastRefresh } = this.state;
    const { fleet } = this.props;

    var s1 = ''
    //console.log('can repair:'+fleet.canRepair);
    if(fleet.canRepair==0){
      s1 =  __('Not ready');
    }else if(fleet.canRepair==1){
      s1 = __('Repairing')
    }else if(fleet.canRepair==2||fleet.canRepair==3){
      s1 = '正在喂奶';
    }else if(fleet.canRepair==4||fleet.canRepair==5){
      s1 = '正在修理和喂奶';
    }
    var lc = this.state.lc;
    //console.log(1111111)
    //console.log(lc)
    //console.log(fleet.canRepair)


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
              countdownId: `milk-${fleet.api_id}`,
              startTime: this.state.lastRefresh,
              showMain:this.props.showm,
              aler:this.props.aler,
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
        null,
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 12 },
          _react2.default.createElement(
            _reactBootstrap.Panel,
            { bsStyle: 'warning', className: lastRefresh === 0 ? '' : 'hidden' },
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
                canRepair: fleet.canRepair
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
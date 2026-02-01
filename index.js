'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.switchPluginPath = exports.reactClass = exports.settingsClass = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Import selectors defined in poi


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reselect = require('reselect');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _reactBootstrap = require('react-bootstrap');

var _selectors = require('views/utils/selectors');

var _functions = require('./parts/functions');

var _fleetList = require('./parts/fleet-list');

var _fleetList2 = _interopRequireDefault(_fleetList);

var _candidates = require('./parts/candidates');

var _candidates2 = _interopRequireDefault(_candidates);

var _settingsClass = _interopRequireDefault(require('./settings-class'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.settingsClass = _settingsClass.default;

const { i18n, getStore } = window;
const __ = i18n['poi-plugin-milk'].__.bind(i18n['poi-plugin-milk']);

const AKASHI_ID = [182, 187]; // akashi and kai ID in $ships
const SRF_ID = 86; // Ship Repair Facility ID in $slotitems


// check a fleet status, returns information related to anchorage repair
const fleetAkashiConv = (fleet, $ships, ships, equips, repairId) => {
  const pickKey = ['api_id', 'api_ship_id', 'api_lv', 'api_nowhp', 'api_maxhp', 'api_ndock_time','api_cond'];

  let canRepair = false;
  let akashiFlagship = false;
  let repairCount = 0;
  const inExpedition = _lodash2.default.get(fleet, 'api_mission.0') && true;
  const flagShipInRepair = _lodash2.default.includes(repairId, _lodash2.default.get(fleet, 'api_ship.0', -1));
  const flagship = ships[_lodash2.default.get(fleet, 'api_ship.0', -1)];

  if (flagship != null) {
    akashiFlagship = _lodash2.default.includes(AKASHI_ID, flagship.api_ship_id);
    repairCount = _lodash2.default.filter(flagship.api_slot, item => _lodash2.default.get(equips, `${item}.api_slotitem_id`, -1) === SRF_ID).length;
    repairCount += akashiFlagship ? 2 : 0;
  }

  canRepair = akashiFlagship && !inExpedition && !flagShipInRepair;

  const repairDetail = _lodash2.default.map(_lodash2.default.filter(fleet.api_ship, shipId => shipId > 0), (shipId, index) => {
    if (shipId === -1) return false; // break, LODASH ONLY

    const ship = _lodash2.default.pick(ships[shipId], pickKey);

    const constShip = _lodash2.default.pick($ships[ship.api_ship_id], ['api_name', 'api_stype']);

    return _extends({}, ship, constShip, {
      cond:ship.api_cond,
      estimate: (0, _functions.akashiEstimate)(ship),
      timePerHP: (0, _functions.getTimePerHP)(ship.api_lv, constShip.api_stype),
      inRepair: _lodash2.default.includes(repairId, ship.api_id),
      availableSRF: index < repairCount
    });
  });

  //console.log(repairDetail)

  var repairStatus = 0
  var flagshipa = _lodash2.default.get(fleet, 'api_ship.0', -1)
  var secondshipa = _lodash2.default.get(fleet, 'api_ship.1', -1)
  var flagshipid = ships[flagshipa]?ships[flagshipa].api_ship_id:-1;
  var secondshipid = ships[secondshipa]?ships[secondshipa].api_ship_id:-1;
  if(canRepair){
    repairStatus = 1;
    if(secondshipid==996
      //||secondshipid==357  //没有野崎，用初月改测试
    ){
      repairStatus = 4;
    }
    if(secondshipid==1002
    ){
      repairStatus = 5;
    }
  }else{
    if(flagshipid==996||secondshipid==996
        //||flagshipid==357||secondshipid==357  //没有野崎，用初月改测试
    ){
      repairStatus = 2;
    }
    if(flagshipid==1002||secondshipid==1002
    ){
      repairStatus = 3;
    }
  }
  //console.log("cc:"+flagshipid)
  canRepair = repairStatus;
  var lastCanRepair = canRepair;
  //console.log("cc2:"+canRepair)
  var lastUpdate = Date.now();
  //var showMain = this.state.showMain;
  return {
    api_id: fleet.api_id || -1,
    shipId: fleet.api_ship || [],
    canRepair,
    akashiFlagship,
    inExpedition,
    flagShipInRepair,
    repairCount,
    repairDetail,
    lastUpdate,
  };
};

// selectors

const repairIdSelector = (0, _reselect.createSelector)([_selectors.repairsSelector], repair => _lodash2.default.map(repair, dock => dock.api_ship_id));

const constShipsSelector = state => state.const.$ships || {};

const fleetsAkashiSelector = (0, _reselect.createSelector)([constShipsSelector, _selectors.fleetsSelector, _selectors.shipsSelector, _selectors.equipsSelector, repairIdSelector], ($ships, fleets, ships, equips, repairId) => ({ fleets: _lodash2.default.map(fleets, fleet => fleetAkashiConv(fleet, $ships, ships, equips, repairId)) })




// React

);const mapStateToProps = (state) => _extends({}, (0, _selectors.createDeepCompareArraySelector)([fleetsAkashiSelector, _selectors.miscSelector], (data, { canNotify }) => _extends({}, data, {
  canNotify
}))(state), {
  openMainTimerOnStart: _lodash2.default.get(state, 'config.plugin.milk.openMainTimerOnStart', false),
  openFifteenMinuteReminderOnStart: _lodash2.default.get(state, 'config.plugin.milk.openFifteenMinuteReminderOnStart', false)
});
const reactClass = exports.reactClass = (0, _reactRedux.connect)(mapStateToProps)(class PluginAnchorageRepair extends _react.Component {

  constructor(props) {
    super(props);

    this.handleSelectTab = key => {
      if(key==-2){
        var showm = this.state.showMain;
        if(!showm){
          showm=0
        }
        this.setState({ activeTab: 1,showMain:1-showm });
      }else if(key==-3){
        var aler = this.state.aler;
        if(!aler){
          aler=0
        }
        this.setState({ activeTab: 1,aler:1-aler});
      }else{
        this.setState({ activeTab: key})
      }

    };

    this.handleSort = index => () => {
      this.setState({
        sortIndex: index
      });
    };

    // this.componentDidMount = () => {
    //   window.addEventListener('game.response', this.handleResponse);
    // };
    //
    // this.componentWillUnmount = () => {
    //   window.removeEventListener('game.response', this.handleResponse);
    // };
    //
    // this.handleResponse = e => {
    //   const {path, postBody} = e.detail;
    //   switch (path) {
    //     case '/kcsapi/api_req_hensei/change': {
    //       this.setState({fleetts:Date.now()});
    //     }
    //     default:
    //   }
    // }


    this.state = {
      activeTab: 1,
      sortIndex: 0,
      showMain: 0,
      aler: 0
    };
  }

  componentDidMount() {
    const openMainTimer = !!this.props.openMainTimerOnStart;
    const open15MinReminder = !!this.props.openFifteenMinuteReminderOnStart;
    if (openMainTimer || open15MinReminder) {
      this.setState(function (prev) {
        return {
          showMain: openMainTimer ? 1 : prev.showMain,
          aler: open15MinReminder ? 1 : prev.aler
        };
      });
    }
  }

  render() {
    var shom = this.state.showMain;
    var aler = this.state.aler;
    return _react2.default.createElement(
      'div',
      { id: 'anchorage-repair' },
      _react2.default.createElement('link', { rel: 'stylesheet', href: (0, _path.join)(__dirname, 'assets', 'style.css') }),
      _react2.default.createElement(
        _reactBootstrap.Tabs,
        { activeKey: this.state.activeTab, onSelect: this.handleSelectTab, id: 'anchorage-tabs' },
        _lodash2.default.map(this.props.fleets, function(fleet, index){
          //console.log(fleet);
          return _react2.default.createElement(
          _reactBootstrap.Tab,
          {
            eventKey: fleet.api_id,
            title: fleet.api_id,
            key: `anchorage-tab-${index}`,
            tabClassName: fleet.canRepair ? 'can-repair' : ''
          },
          _react2.default.createElement(_fleetList2.default, { fleet: fleet,showm:shom,aler:aler})
        )}
            ),
        _react2.default.createElement(
          _reactBootstrap.Tab,
          {
            className: 'candidate-pane',
            eventKey: -1,
            title: __('Candidates')
          },
          _react2.default.createElement(_candidates2.default, { handleSort: this.handleSort, sortIndex: this.state.sortIndex })
        ),
        _react2.default.createElement(
          _reactBootstrap.Tab,
          {
            className: 'span',
            eventKey: -2,
            title: '主面板计时:'+((this.state.showMain==0)?'关':'开')
          }
        ),
        _react2.default.createElement(
          _reactBootstrap.Tab,
          {
            className: 'span',
            eventKey: -3,
            onClick: this.aler,
            title: '15分钟提醒:'+((this.state.aler==0)?'关':'开')
          }
        )

      ),
  //     <div>
  //     <Button bsSize="small" onClick={this.handleOn}
  //   bsStyle={this.state.onlog ? "success" : "danger"} style={{width: '100%'}}>
  //   {this.state.onlog ? "关闭log" : "开启log"}
  // </Button>
  //   </div>
      // _react2.default.createElement(
      //   'Button',
      //   {bsSize:'small'},
      //   {bsStyle:'danger'},
      //   '主面板显示第一舰队计时器'
      // )
    )

      ;
  }
}

/*

   The following APIs are called in order when a fleet returns from expedition:

   - api_req_mission/result
   - api_port/port

   As anchorage repair pops up conditionally on the latter one,
   it also prevents other plugins' auto-switch mechanism on
   tracking api_req_mission/result calls.

   The problem is solved by applying a lock upon expedition returns
   and ignoring the immediately followed api_port/port call.

 */
);let expedReturnLock = null;
const clearExpedReturnLock = () => {
  if (expedReturnLock !== null) {
    clearTimeout(expedReturnLock);
    expedReturnLock = null;
  }
};

const switchPluginPath = exports.switchPluginPath = [{
  path: '/kcsapi/api_port/port',
  valid: () => {
    if (expedReturnLock !== null) {
      /*
         this is the immediately followed api_port/port call
         after an expedition returning event.
       */
      clearExpedReturnLock();
      return false;
    }

    const { fleets = [], ships = {}, equips = {}, repairs = [] } = getStore('info') || {};
    const $ships = getStore('const.$ships');
    const repairId = repairs.map(dock => dock.api_ship_id);

    const result = fleets.map(fleet => fleetAkashiConv(fleet, $ships, ships, equips, repairId));
    //console.log(result)
    var ret =  result.some(fleet =>
      ((fleet.canRepair ==1 )&& fleet.repairDetail.some(ship => ship.estimate > 0)) ||
      ((fleet.canRepair ==2 || fleet.canRepair ==3 )&& fleet.repairDetail.some(ship => ship.cond < 54)) ||
      ((fleet.canRepair ==4 || fleet.canRepair ==5 )&&
        (fleet.repairDetail.some(ship => ship.cond < 54) || fleet.repairDetail.some(ship => ship.estimate > 0))
      )
    );
    //console.log('1111111111:'+ret);
    return ret;
  }
}, {
  path: '/kcsapi/api_req_mission/result',
  valid: () => {
    clearExpedReturnLock();
    expedReturnLock = setTimeout(clearExpedReturnLock,
    /*
       allow a window of 5 secnds before the lock
       clears itself
     */
    5000);
    return false;
  }
}];
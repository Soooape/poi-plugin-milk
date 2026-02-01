'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCountdownLabelStyle = exports.getHPLabelStyle = exports.repairEstimate = exports.getTimePerHP = exports.timePerHPCalc = exports.akashiEstimate = exports.AKASHI_INTERVAL = exports.getCanRepairStatus = undefined;

var _factor = require('./factor');

var _factor2 = _interopRequireDefault(_factor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const AKASHI_INTERVAL = exports.AKASHI_INTERVAL = 20 * 60 * 1000; // minimum time required, in ms
const DOCKING_OFFSET = 30 * 1000; // offset in docking time formula
const MINOR_PERCENT = 0.5; // minor damage determination

const minuteCeil = time => {
  const minute = 60 * 1000;

  return Math.ceil(time / minute) * minute;
};

// estimate the time needed in anchorage repair
const akashiEstimate = exports.akashiEstimate = ({ api_nowhp, api_maxhp, api_ndock_time }) => {
  if (api_ndock_time === 0 || api_nowhp >= api_maxhp) return 0;

  if (api_nowhp <= api_maxhp * MINOR_PERCENT) return 0; // damage check

  if (api_maxhp - api_nowhp === 1) return AKASHI_INTERVAL; // if only 1 hp to repair

  return Math.max(minuteCeil(api_ndock_time - DOCKING_OFFSET), AKASHI_INTERVAL);
};

const timePerHPCalc = exports.timePerHPCalc = ({ api_nowhp, api_maxhp, api_ndock_time }) => api_nowhp < api_maxhp && api_nowhp >= api_maxhp * MINOR_PERCENT ? (api_ndock_time - DOCKING_OFFSET) / (api_maxhp - api_nowhp) : 0;

// alternative way for timePerHP
const getTimePerHP = exports.getTimePerHP = (api_lv = 1, api_stype = 1) => {
  let factor;
  if (_factor2.default[api_stype] != null) factor = _factor2.default[api_stype].factor || 0;

  if (factor === 0) return 0;

  if (api_lv < 12) {
    return api_lv * 10 * factor * 1000;
  }

  return (api_lv * 5 + (Math.floor(Math.sqrt(api_lv - 11)) * 10 + 50)) * factor * 1000;
};

const repairEstimate = exports.repairEstimate = ({ api_nowhp, api_maxhp, timePerHP }, timeElapsed = 0, availableSRF = false) => {
  // timeElapsed is in seconds
  if (api_nowhp >= api_maxhp || timePerHP === 0 || !availableSRF) return 0;

  if (timeElapsed * 1000 < AKASHI_INTERVAL) {
    return 0;
  }

  return Math.min(Math.max(Math.floor(timeElapsed * 1000 / timePerHP), 1), api_maxhp - api_nowhp);
};

const getHPLabelStyle = exports.getHPLabelStyle = (nowhp, maxhp, availableSRF = true, inRepair = false) => {
  const percentage = nowhp / maxhp;
  if (!availableSRF) {
    return 'warning';
  }
  switch (true) {
    case percentage >= 1 || inRepair:
      return 'success';
    case percentage >= MINOR_PERCENT:
      return 'primary';
    case percentage < MINOR_PERCENT:
      return 'warning';
    default:
      return 'warning';
  }
};

const getCountdownLabelStyle = exports.getCountdownLabelStyle = (props, timeRemaining) => {
  switch (true) {
    case timeRemaining > 600:
      return 'primary';
    case timeRemaining > 60:
      return 'warning';
    case timeRemaining >= 0:
      return 'success';
    default:
      return 'default';
  }
};


const getCanRepairStatus = exports.getCanRepairStatus = function(fleet){
  var flagshipa = _lodash2.default.get(fleet, 'api_ship.0', -1)
  var secondshipa = _lodash2.default.get(fleet, 'api_ship.1', -1)
  var flagshipid = _ships[flagshipa]?_ships[flagshipa].api_ship_id:-1;
  var secondshipid = _ships[secondshipa]?_ships[secondshipa].api_ship_id:-1;
  var newCanRepair = 0;
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
  return newCanRepair

}
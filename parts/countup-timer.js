'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _tools = require('views/utils/tools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CountupTimer extends _react.Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: this.props.startTime
    };

    this.componentDidMount = () => {
      this.startTick();
    };

    this.componentWillReceiveProps = nextProps => {
      if (nextProps.countdownId !== this.props.countdownId) {
        this.stopTick();
      }
      if (nextProps.startTime !== this.state.startTime) {
        this.setState({ startTime: nextProps.startTime });
        this.timeElapsed = this.constructor.getTimeElapsed(nextProps.startTime);
      }
    };

    this.shouldComponentUpdate = (nextProps, nextState) => nextProps.countdownId !== this.props.countdownId || nextState.startTime !== this.state.startTime;

    this.componentDidUpdate = () => {
      this.startTick // Doesn't matter if it didn't stop
      ();
    };

    this.componentWillUnmount = () => {
      this.stopTick();
    };

    this.startTick = () => {
      window.ticker.reg(this.props.countdownId, this.tick);
    };

    this.stopTick = () => {
      window.ticker.unreg(this.props.countdownId);
    };

    this.tick = currentTime => {
     // console.log('will tick');
      // const actualElapsed = this.constructor.getTimeElapsed(this.state.startTime, currentTime)
      // if (Math.abs(this.timeElapsed - actualElapsed) > 2) {
      //   this.timeElapsed = actualElapsed
      // }
      // console.log('id');
      // console.log(this.props.countdownId)
      this.timeElapsed = this.constructor.getTimeElapsed(this.state.startTime, currentTime);
      //console.log(this.timeElapsed);
      if (this.timeElapsed < 0) {
        this.stopTick();
      }
      if (this.state.startTime >= 0) {
        try {
          if (this.textLabel) {
            this.textLabel.textContent = (0, _tools.resolveTime)(this.timeElapsed) || (0, _tools.resolveTime)(0);
          }
          if (this.props.tickCallback) {
            this.props.tickCallback(this.timeElapsed);
          }
          if (this.timeElapsed < 1 && this.props.startCallback) {
            this.props.startCallback();
          }
        } catch (error) {
          console.error(error.stack);
        }
      }
      var cid = this.props.countdownId;
      this.timeElapsed += 1;
      if(this.props.aler==1&&this.timeElapsed==900&&cid.endsWith('1')){
        window.toast('15分钟:状态已恢复');
        window.notify('15分钟:状态已恢复');
      }
      //console.log(this.timeElapsed);
      //console.log(this.props.aler);

      if(cid.endsWith('1')&&this.timeElapsed>1){
        var tdiv = document.getElementsByClassName('teitoku-panel');
        if(tdiv.length==1){
          var td1 = tdiv[0].getElementsByTagName('div');
          var tsp = td1[0].childNodes;
          var min = Math.floor(this.timeElapsed/60);
          var sec = this.timeElapsed - min*60;
          var tstr = (min<10?('0'+min):min)+':'+(sec<10?('0'+sec):sec)
          var sp = document.createElement('span');
          sp.innerText = tstr;
          sp.style.color='orange'
          if(tsp.length==4){
            if(this.props.showMain==1){
              td1[0].append(sp);
            }
          }else if(tsp.length==5) {
            var fh = tsp[0].outerHTML + tsp[1].outerHTML + tsp[2].outerHTML + tsp[3].outerHTML
            if (this.props.showMain == 1) {
              td1[0].removeChild(tsp[4]);
              td1[0].append(sp);
            } else {
              td1[0].removeChild(tsp[4]);
            }

          }
        }
      }
    };

    this.timeElapsed = this.constructor.getTimeElapsed(this.props.startTime);
  }

  render() {
    return _react2.default.createElement(
      'span',
      { ref: ref => {
          this.textLabel = ref;
        } },
      (0, _tools.resolveTime)(this.timeElapsed)
    );
  }
}
exports.default = CountupTimer; // similar to CountdownTimer in 'views/components/main/parts/countdown-timer.es', but it counts up

CountupTimer.propTypes = {
  countdownId: _propTypes2.default.string.isRequired, // UNIQUE ID to register to window.ticker
  startTime: _propTypes2.default.number, // startTime in ms
  tickCallback: _propTypes2.default.func, // callback function for each second
  startCallback: _propTypes2.default.func // callback function when starting to count up
};

CountupTimer.getTimeElapsed = (startTime, currentTime = Date.now()) => {
  if (startTime <= 0) {
    return -1;
  } else if (startTime > currentTime) {
    return 0;
  }
  return Math.round((currentTime - startTime) / 1000);
};

CountupTimer.defaultProps = {
  startTime: -1,
  tickCallback: null,
  startCallback: null
};
module.exports = exports['default'];
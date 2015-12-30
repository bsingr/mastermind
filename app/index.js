'use babel';
'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const {DragSource, DropTarget, DragDropContext, DragLayer} = require('react-dnd');
const TouchBackend = require('react-dnd-touch-backend').default;

var tokenTarget = {
  canDrop: function (props) {
    return true;
  },
  drop: function (props, monitor) {
    props.changeCurrentAttempt(monitor.getItem().value, props.idx);
  }
};

const tokenSource = {
  beginDrag: function (props) {
    return {value: props.value};
  }
};

function collectDragPreview(monitor) {
  return {
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    position: monitor.getClientOffset()
  };
}

function collectDrag(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

function collectDrop(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver()
  };
}

function Token(props) {
  let color;
  if (props.value > -1) {
    color = [
      'rgb(167, 0, 50)',
      'rgb(33, 130, 200)',
      'rgb(242, 203, 0)',
      'rgb(67, 177, 0)',
      'rgb(32, 32, 32)',
      'rgb(191, 18, 136)',
    ][props.value];
  } else {
    color = 'gray';
  }
  return <div className={`${props.classNamePrefix}token`} style={{
    backgroundColor: color
  }} />
}

const DragToken = DragSource('token', tokenSource, collectDrag)(props =>
  props.connectDragSource(Token(props))
)

const DropToken = DropTarget('token', tokenTarget, collectDrop)(props =>
  props.connectDropTarget(Token(props))
)

class PreviewToken extends React.Component {
  render() {
    const {isDragging, item, position} = this.props;
    let value, offset;
    if (isDragging && position) {
      value = this.props.item.value;
      offset = position;
    } else {
      value = "";
      offset = {x: 0, y: 0}
    }
    return <div style={{
      position: 'absolute',
      top: offset.y - 30,
      left: offset.x - 30
    }}><Token value={value} classNamePrefix="preview__" /></div>;
  }
}

const DragPreviewToken = DragLayer(collectDragPreview)(PreviewToken);

class Row extends React.Component {
  render() {
    const { tokens, highlightToken, classNamePrefix } = this.props;
    return <div className={`${classNamePrefix}row`}>{tokens.map((token, i) => {
      return <DragToken key={i} idx={i} classNamePrefix={classNamePrefix} isHighlighted={token === highlightToken} value={token} />
    })}</div>;
  }
}

class DropRow extends React.Component {
  render() {
    const { tokens, highlightToken, classNamePrefix } = this.props;
    return <div className={`${classNamePrefix}row`}>{tokens.map((token, i) => {
      return <DropToken key={i} idx={i} classNamePrefix={classNamePrefix} isHighlighted={token === highlightToken} value={token} changeCurrentAttempt={this.props.changeCurrentAttempt} />
    })}</div>;
  }
}

class RawApp extends React.Component {
  componentDidUpdate() {
    if (this.props.success) {
      this.refs.audio.play();
    }
  }
  render() {
    const {tokens, secret, numberOfAttempts, attempts, currentAttempt, success, success_audio_src} = this.props;
    const {changeCurrentAttempt, solve} = this.props;
    let badge;
    if (success) {
      badge = <div className="badge" onClick={() => confirm('Again?') && window.location.reload()}>
        <br/><br/>Win!
      </div>;
    }
    return <div className="expand">
      {attempts.map((attempt, i) => {
        return <div className="attempt" key={i}>
          <Row classNamePrefix="attempt__" tokens={attempt} />
          <div className="attempt__score"
               style={{color: isValidAttempt(attempt) ? 'red' : 'white'}}>
            {hits(secret, attempt)}
          </div>
          <div className="attempt__score"
               style={{color: isValidAttempt(attempt) ? 'black' : 'white'}}>
            {nearbyHits(secret, attempt)}
          </div>
        </div>
      })}
      <div className="current">
        <DropRow classNamePrefix="current__" tokens={currentAttempt} changeCurrentAttempt={changeCurrentAttempt} />
        <button className="current__solve" disabled={!isValidAttempt(currentAttempt)} onClick={solve}>Solve</button>
      </div>
      <Row classNamePrefix="source__" tokens={tokens} />
      <DragPreviewToken />
      <audio autoPlay={false} ref="audio">
        <source src={success_audio_src} type="audio/aac" />
      </audio>
      {badge}
    </div>;
  }
}

const App = DragDropContext(TouchBackend({enableMouseEvents: true}))(RawApp);

function initialState(bindAction) {
  const tokens = [0,1,2,3,4,5];
  return {
    tokens: tokens,
    secret: pickRandomTokens(tokens, 4, false),
    numberOfAttempts: 0,
    attempts: Array.apply(null, {length: 6}).map(() => newAttempt()),
    currentAttempt: newAttempt(),
    success: false,
    success_audio_src: `audio/success_${Math.round(Math.random())}.aac`,
    changeCurrentAttempt: bindAction(update => getState => (token, i) => {
      getState().currentAttempt[i] = token;
      update();
    }),
    solve: bindAction(update => getState => () => {
      const state = getState();
      if (isValidAttempt(state.currentAttempt)) {
        if (hits(state.secret, state.currentAttempt) == 4) {
          state.success = true;
        }
        state.attempts.push(state.currentAttempt);
        state.attempts.shift();
        state.currentAttempt = state.currentAttempt.slice(0);
        state.numberOfAttempts++;
        update();
      }
    })
  };
}


(function () {
  const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  document.body.style.height = `${height - 4}px`;

  const state = initialState((action) => {
    return action(render)(() => state)
  })

  render();

  function render() {
    ReactDOM.render(
      <App {...state} />,
      document.getElementsByTagName('main')[0]
    );
  }
})();

function newAttempt() {
  return [-1, -1, -1, -1]
}

function isValidAttempt(attempt) {
  return attempt.indexOf(-1) === -1;
}

function pickRandomTokens(_tokens, numberOfTokens, allowDuplicates) {
  var tokens = _tokens.slice(0);
  var pickedTokens = [];
  for (var i = 0; i < numberOfTokens; i++) {
    let token;
    const random = Math.round(Math.random() * (tokens.length - 1));
    if (allowDuplicates) {
      token = random;
    } else {
      token = tokens.splice(random, 1)[0];
    }
    pickedTokens.push(token);
  }
  return pickedTokens;
}

function hits(secret, attempt) {
  var score = 0;
  secret.forEach(function (token, i) {
    if (attempt.indexOf(token) > -1 && attempt[i] === token) {
      score++;
    }
  });
  return score;
}

function nearbyHits(secret, _attempt) {
  var attempt = _attempt.slice(0);
  var score = 0;
  secret.forEach(function (token, i) {
    var j = attempt.indexOf(token);
    if (j > -1) {
      attempt.splice(j, 1);
      score++;
    }
  });
  return score - hits(secret, _attempt);
}

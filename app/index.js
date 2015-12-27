'use babel';
'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

class Token extends React.Component {
  render() {
    let color;
    if (this.props.value > -1) {
      color = ['red', 'blue', 'yellow', 'cyan', 'black', 'green', 'magenta'][this.props.value];
    } else {
      color = 'gray';
    }
    return <div className="token" style={{
      backgroundColor: color,
      borderColor: this.props.isHighlighted ? 'white' : color
    }} onClick={this.props.onClick}/>
  }
}

class Row extends React.Component {
  render() {
    const { tokens, highlightToken } = this.props;
    return <div className="row">{tokens.map((token, i) => {
      return <Token key={i} isHighlighted={token === highlightToken} value={token} onClick={() => this.props.onClick ? this.props.onClick(token, i) : ''} />
    })}</div>;
  }
}

(function () {
  var tokens = [0,1,2,3,4,5];
  var secret = pickRandomTokens(tokens, 4, false);
  var numberOfAttempts = 0;
  var attempts = Array.apply(null, {length: 6}).map(() => newAttempt());
  var currentAttempt = newAttempt();
  var currentToken = 0;

  render();

  function render() {
    ReactDOM.render(
      <div>
        {attempts.map((attempt, i) => {
          return <div className="attempt" key={i}>
            <Row tokens={attempt} />
            <span className="score" style={{color: numberOfAttempts > i ? 'red' : 'white'}}>{hits(secret, attempt)}</span>
            <span className="score" style={{color: numberOfAttempts > i ? 'black' : 'white'}}>{nearbyHits(secret, attempt)}</span>
          </div>
        })}
        <div className="current">
          <Row tokens={currentAttempt} onClick={(token, i) => {
            currentAttempt[i] = currentToken;
            render();
          }} />
          <button disabled={!isValidAttempt(currentAttempt)} onClick={() => {
            if (isValidAttempt(currentAttempt)) {
              attempts.splice(numberOfAttempts, 1, currentAttempt);
              currentAttempt = currentAttempt.slice(0);
              numberOfAttempts++;
              render();
            }
          }}>Try</button>
        </div>
        <div className="source">
          <Row tokens={tokens} highlightToken={currentToken} onClick={(token, i) => {
            currentToken = token;
            render();
          }} />
        </div>
      </div>,
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

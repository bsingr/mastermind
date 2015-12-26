'use babel';
'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

class Token extends React.Component {
  render() {
    const color = ['red', 'blue', 'yellow', 'cyan', 'blue', 'green', 'magenta'][this.props.value];
    return <div className="token" style={{backgroundColor: color}} onClick={this.props.onClick}/>
  }
}

class Row extends React.Component {
  render() {
    return <div className="row">{this.props.tokens.map((token, i) =>
      <Token key={i} value={token} onClick={() => this.props.onClick ? this.props.onClick(token, i) : ''} />
    )}</div>;
  }
}

(function () {
  var tokens = [0,1,2,3,4,5];
  var secret = pickRandomTokens(tokens, 4);
  var previousAttempts = [];
  var currentAttempt = pickRandomTokens(tokens, 4);
  var currentToken = 0;

  render();

  function render() {
    ReactDOM.render(
      <div>
        <Row tokens={secret} />
        <br />
        {previousAttempts.map((attempt, i) => {
          return <div key={i}>
            <Row tokens={attempt} />
            {hits(secret, attempt)}
            {nearbyHits(secret, attempt)}
            <br />
          </div>
        })}
        <br />
        <Row tokens={currentAttempt} onClick={(token, i) => {
          currentAttempt[i] = currentToken;
          render();
        }} />
        <br />
        <Row tokens={tokens} onClick={(token, i) => {
          currentToken = token;
          render();
        }} />
        <br />
        <Token value={currentToken} />
        <br />
        <button onClick={() => {
          previousAttempts.push(currentAttempt);
          currentAttempt = pickRandomTokens(tokens, 4);
          render();
        }}>Bet</button>
      </div>,
      document.getElementsByTagName('main')[0]
    );
  }
})();

function pickRandomTokens(tokens, numberOfTokens) {
  var pickedTokens = [];
  for (var i = 0; i < numberOfTokens; i++) {
    pickedTokens.push(Math.round(Math.random() * (tokens.length - 1)));
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

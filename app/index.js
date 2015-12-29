'use babel';
'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

class Token extends React.Component {
  render() {
    let color;
    if (this.props.value > -1) {
      color = [
        'rgb(167, 0, 50)',
        'rgb(33, 130, 200)',
        'rgb(242, 203, 0)',
        'rgb(67, 177, 0)',
        'rgb(32, 32, 32)',
        'rgb(191, 18, 136)',
      ][this.props.value];
    } else {
      color = 'gray';
    }
    return <div className={`${this.props.classNamePrefix}token ${this.props.isHighlighted ? 'highlighted' : ''} `} style={{
      backgroundColor: color
    }} onClick={this.props.onClick}/>
  }
}

class Row extends React.Component {
  render() {
    const { tokens, highlightToken, classNamePrefix } = this.props;
    return <div className={`${classNamePrefix}row`}>{tokens.map((token, i) => {
      return <Token key={i} classNamePrefix={classNamePrefix} isHighlighted={token === highlightToken} value={token} onClick={() => this.props.onClick ? this.props.onClick(token, i) : ''} />
    })}</div>;
  }
}

class App extends React.Component {
  render() {
    const {tokens, secret, numberOfAttempts, attempts, currentAttempt, currentToken} = this.props;
    const {changeCurrentAttempt, changeCurrentToken, solve} = this.props;
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
        <Row classNamePrefix="current__" tokens={currentAttempt} onClick={changeCurrentAttempt} />
        <button className="current__solve" disabled={!isValidAttempt(currentAttempt)} onClick={solve}>Solve</button>
      </div>
      <Row classNamePrefix="source__" tokens={tokens} highlightToken={currentToken} onClick={changeCurrentToken} />
    </div>;
  }
}

(function () {
  const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  document.body.style.height = `${height - 4}px`;

  const tokens = [0,1,2,3,4,5];

  const props = {
    tokens: tokens,
    secret: pickRandomTokens(tokens, 4, false),
    numberOfAttempts: 0,
    attempts: Array.apply(null, {length: 6}).map(() => newAttempt()),
    currentAttempt: newAttempt(),
    currentToken: 0,
    changeCurrentAttempt: (token, i) => {
      props.currentAttempt[i] = props.currentToken;
      render();
    },
    changeCurrentToken: (token, i) => {
      props.currentToken = token;
      render();
    },
    solve: () => {
      if (isValidAttempt(props.currentAttempt)) {
        if (hits(props.secret, props.currentAttempt) == 4) {
          if (typeof(localStorage) !== "undefined") {
            let wins = parseInt(localStorage.getItem('wins'), 10) || 0;
            wins++;
            localStorage.setItem('wins', wins);
            alert(`You won the ${wins} time!`);
            window.location.reload();
          } else {
            alert('You won! Congratulations!');
          }
        }
        props.attempts.push(props.currentAttempt);
        props.attempts.shift();
        props.currentAttempt = props.currentAttempt.slice(0);
        props.numberOfAttempts++;
        render();
      }
    }
  };

  render();

  function render() {
    ReactDOM.render(
      <App {...props} />,
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

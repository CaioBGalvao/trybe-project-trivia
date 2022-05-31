import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Header from '../components/Header';
import { fetchAPI } from '../redux/actions/gameStart';

class Game extends Component {
  constructor() {
    super();
    this.state = {
      redirect: false,
      questionsCount: 0,
      seconds: 5, // acrescenta estado com o valor 30
      disableButton: false, // adiciona estado para controlar botoes de resposta
      questionTimer: true,
      btnNext: false,
      plusplus: 0,
    };
  }

  async componentDidMount() {
    console.log('ola, mundo'); // valida token ao montar componente
    const { dispatch } = this.props;
    const { questionTimer } = this.state;
    const chave = localStorage.getItem('token');
    await dispatch(fetchAPI(chave));
    if (questionTimer === true) {
      this.timerDidMount();
    }
  }

  componentDidUpdate() {
    this.redirectIfInvalidToken();
  }

  timerDidMount = () => {
    const ONE_MILISEC = 1000; // 1 second = 1000 milliseconds.
    this.timer = setInterval(this.timerToAnswer, ONE_MILISEC); // The setInterval() method calls a function at specified intervals (in milliseconds).
  }

  btnNextIplusplus = () => {
    const { plusplus } = this.state;
    const maxQuestions = 4;
    if (plusplus === maxQuestions) {
      this.setState({ plusplus: 4, btnNext: false });
    } else {
      this.setState({
        plusplus: plusplus + 1,
        disableButton: false,
        questionTimer: true,
        btnNext: false,
        seconds: 5,
      });
    }
    this.timerDidMount();
  }

  redirectIfInvalidToken = () => {
    const { tokenResponse } = this.props;
    const responseCode = tokenResponse.response_code;
    if (responseCode !== 0) {
      localStorage.removeItem('token');
      this.setState({
        redirect: true,
      });
    }
  }

  ramdomizerAnswers = () => {
    const { questionsCount } = this.state;
    const { toAsk } = this.props;
    const { questions } = toAsk;
    const { results } = questions;
    const question = results[questionsCount];
    const ZERO_DOT_FIVE = 0.5;
    const toRandomizeAnswers = [
      ...question.incorrect_answers,
      question.correct_answer,
    ];
    const ramdomAnswers = toRandomizeAnswers.sort(
      () => Math.random() - ZERO_DOT_FIVE,
    );
    return ramdomAnswers;
  }

  youAnsweredCorrectly = () => {

  }

  timerToAnswer = () => {
    const { seconds } = this.state;
    if (seconds > 0) {
      this.setState({
        seconds: seconds - 1,
      });
    } else {
      clearInterval(this.timer); // The setInterval() method continues calling the function until clearInterval() is called, or the window is closed.
      this.setState({ disableButton: true, questionTimer: false, btnNext: true });
    }
  }

  render() {
    const {
      redirect,
      questionsCount,
      seconds,
      disableButton,
      btnNext,
      plusplus } = this.state;
    const { toAsk } = this.props;
    const { questions } = toAsk;
    const { results } = questions;
    if (typeof results === 'undefined') {
      return 'deu ruim';
    }
    const query = results[questionsCount];
    console.log('query', query);
    // const { category, question } = query;
    return (
      <>
        { redirect && <Redirect to="/" /> }
        <Header />
        <main>
          <section>
            <div>
              <span data-testid="question-category">{ results[plusplus].category }</span>
              <span data-testid="question-text">{ results[plusplus].question }</span>
            </div>
          </section>
          <section>
            {this.ramdomizerAnswers()
              .map((answers = results[plusplus].answers, index) => (
                <button
                  key={ index }
                  disabled={ disableButton }
                  type="button"
                  data-testid={ () => {
                    if (answers === query.correct_answer) {
                      return 'correct-answer';
                    }
                    return `wrong-answer-${index}`;
                  } }
                // onClick={ () => {
                //   if (answers === query.correct_answer) {
                //     youAnsweredCorrectly();
                //   }
                //   youAnsweredWrong();
                // } }
                >
                  { answers }

                </button>
              ))}

            <h1>
              {`Tempo: ${seconds}`}
            </h1>
            {
              btnNext
              && (
                <button
                  type="submit"
                  data-testid="btn-next"
                  onClick={ this.btnNextIplusplus }
                >
                  Next
                </button>
              )
            }

          </section>
        </main>
      </>
    );
  }
}

Game.propTypes = {
  tokenResponse: PropTypes.shape({
    token: PropTypes.string.isRequired,
    response_code: PropTypes.number.isRequired,
  }).isRequired,
  toAsk: PropTypes.shape.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  tokenResponse: state.tokenSaver,
  toAsk: state.game,
});

export default connect(mapStateToProps, null)(Game);

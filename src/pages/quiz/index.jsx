import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QuizzApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [start, setStart] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [questionDone, setQuestionDone] = useState({
    scores: [],
  });

  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);

  const [shuffledOptions, setShuffledOptions] = useState([]);

  useEffect(() => {
    if ((currentIndex || timer || selectedAnswer, totalQuestionsAnswered)) {
      localStorage.setItem('quizState', JSON.stringify({ currentIndex, timer, selectedAnswer, questions, shuffledOptions, totalQuestionsAnswered }));
    }
  }, [currentIndex, timer, selectedAnswer, questions, shuffledOptions, totalQuestionsAnswered]);

  useEffect(() => {
    const storedState = localStorage.getItem('quizState');
    if (storedState) {
      const { currentIndex: storedIndex, timer: storedTimer, selectedAnswer: storedAnswer, questions: storedQuestions, shuffledOptions: storedShuffledOptions, totalQuestionsAnswered: storeTotalQuestionsAnswered } = JSON.parse(storedState);
      setCurrentIndex(storedIndex);
      setTimer(storedTimer);
      setSelectedAnswer(storedAnswer);
      setQuestions(storedQuestions);
      setShuffledOptions(storedShuffledOptions);
      setTotalQuestionsAnswered(storeTotalQuestionsAnswered);
    }
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://opentdb.com/api.php?amount=10&category=27&difficulty=easy&type=multiple');
      const results = response.data.results;
      setQuestions(results);
      const options = results[currentIndex]?.incorrect_answers.concat(results[currentIndex]?.correct_answer);
      setShuffledOptions(shuffleArray(options));
      setIsLoading(false);
      localStorage.setItem('startQuiz', true);
      setTimer(60);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    const storedScores = localStorage.getItem('quizScores');
    if (storedScores) {
      const parsedScores = JSON.parse(storedScores);
      setQuestionDone((prevQuestionDone) => ({
        ...prevQuestionDone,
        scores: parsedScores,
      }));
    }
  }, []);

  console.log(totalQuestionsAnswered);

  const handleFinish = () => {
    const quizData = {
      correctAnswers,
      incorrectAnswers: questions?.length - correctAnswers,
      totalQuestions: currentIndex >= 9 ? currentIndex + 1 : currentIndex,
    };
    const existingScores = JSON.parse(localStorage.getItem('quizScores')) || [];
    existingScores.push(quizData);

    localStorage.setItem('quizScores', JSON.stringify(existingScores));

    localStorage.removeItem('startQuiz');
    localStorage.removeItem('quizState');
    setTimer(0);
    setStart(false);

    navigate('/quizz');

    setQuestionDone((prevQuestionDone) => ({
      ...prevQuestionDone,
      scores: existingScores,
    }));

    setCurrentIndex(0);
    setCorrectAnswers(0);
  };

  useEffect(() => {
    let intervalId;
    if (timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (start) {
      handleFinish();
    }
    return () => clearInterval(intervalId);
  }, [timer, start]);

  useEffect(() => {
    const storedTimer = localStorage.getItem('quizTimer');
    if (storedTimer) {
      setTimer(parseInt(storedTimer));
    }
  }, []);

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const currentQuestion = questions[currentIndex];
      if (selectedAnswer === currentQuestion?.correct_answer) {
        setCorrectAnswers((prevCorrectAnswers) => prevCorrectAnswers + 1);
      }

      if (currentIndex < questions?.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        const options = questions[currentIndex + 1]?.incorrect_answers.concat(questions[currentIndex + 1]?.correct_answer);
        setShuffledOptions(shuffleArray(options));
      } else {
        handleFinish();
      }

      setSelectedAnswer(null);
      setTotalQuestionsAnswered((prevTotal) => prevTotal + 1);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const shuffleArray = (array) => {
    for (let i = array?.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    if (storedLoginStatus) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/quizz');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const startQuiz = localStorage.getItem('startQuiz');
    if (startQuiz) {
      setStart(true);
    }
  }, [start]);

  return (
    <section className="flex flex-col justify-center items-center h-screen ">
      {timer <= 0 ? (
        <div className="flex justify-center flex-col gap-4 items-center w-max">
          <h1 className="text-4xl font-semibold text-center mb-2">Quizz zeru</h1>
          <button onClick={fetchQuestions} className="bg-neutral-800  w-[200px] text-white py-2 hover:bg-transparent hover:text-neutral-800 border-neutral-800 border transition-all ease-in-out duration-300 rounded-md text-xl">
            {isLoading ? 'Loading...' : 'Start'}
          </button>
          <div className="bg-white p-12 rounded-lg shadow-lg w-max mt-8">
            <h1 className="font-bold text-2xl">Nilai : </h1>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Jumlah Benar</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Jumlah Salah</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Jumlah Jawab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {questionDone?.scores?.map((score, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{score.correctAnswers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{score.incorrectAnswers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{score.totalQuestions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex justify-center flex-col gap-4">
          <h1 className="text-4xl font-semibold">Quizz zeru</h1>

          <div className="bg-white p-12 rounded-lg shadow-lg w-[800px] mt-8">
            <div className="flex justify-between">
              <p className="text-base">Soal yang dikerjakan : {currentIndex + 1}/10</p>
              <p className="text-base">
                Timer :{' '}
                {Math.floor(timer / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(timer % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <h1 className="text-2xl font-bold mt-4">
              {currentIndex + 1}. {questions[currentIndex]?.question}
            </h1>
            <div className="flex flex-col justify-center w-full mt-4 gap-3">
              {shuffledOptions?.map((option, index) => (
                <div key={index} className={`border py-3 px-6 cursor-pointer rounded-sm border-neutral-800 ${selectedAnswer === option ? 'bg-neutral-800 text-white' : 'border-neutral-800'}`} onClick={() => handleAnswerSelect(option)}>
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default QuizzApp;

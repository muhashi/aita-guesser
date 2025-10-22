import React, { useState, useEffect } from 'react';
import { MantineProvider, Container, Title, Button, Card, Text, Group, Stack, Badge, Paper, Anchor } from '@mantine/core';
import DATASET from './dataset.json';
import ConfettiExplosion from 'react-confetti-blast';


function shuffle(array) {
  const newArray = [...array];

	for (let index = newArray.length - 1; index > 0; index--) {
		const newIndex = Math.floor(Math.random() * (index + 1));
		[newArray[index], newArray[newIndex]] = [newArray[newIndex], newArray[index]];
	}

	return newArray;
}

function getDaysSinceEpoch() {
  const now = new Date();
  const epoch = new Date(Date.UTC(2025, 9, 18)); // October 18, 2025 UTC
  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = nowUTC - epoch.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTimeUntilNextDaily() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const diff = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}

function getDailyPosts() {
  const day = getDaysSinceEpoch();
  const startIdx = (day * 3) % DATASET.length;
  const posts = [];
  
  for (let i = 0; i < 3; i++) {
    posts.push(DATASET[(startIdx + i) % DATASET.length]);
  }
  
  return posts;
}

function getRandomPosts() {
  const shuffled = shuffle(DATASET);
  return shuffled.slice(0, 3);
}

const AnimatedTitle = () => {
  const [animate, setAnimate] = useState(false);
  const words = ['AITA', 'Guesser'];
  const colors = ['#e55643', '#2b9f5e'];

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div style={{ 
      position: 'relative',
      margin: '0 auto',
      textAlign: 'center',
      cursor: 'default',
      userSelect: 'none'
    }}>
      {words.map((word, wordIndex) => (
        <div key={wordIndex} style={{
          display: 'block',
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%) rotate(-5deg)',
          marginBottom: wordIndex === 0 ? '-5px' : '0'
        }}>
          {word.split('').map((char, charIndex) => (
            <span
              key={charIndex}
              style={{
                display: 'inline-block',
                fontSize: '4rem',
                fontWeight: 800,
                letterSpacing: '2px',
                color: colors[wordIndex],
                textShadow: '#533d4a 1px 1px, #533d4a 2px 2px, #533d4a 3px 3px, #533d4a 4px 4px, #533d4a 5px 5px, #533d4a 6px 6px',
                transform: 'skew(-5deg)',
                opacity: animate ? 1 : 0,
                position: 'relative',
                bottom: animate ? 0 : '-80px',
                transition: `all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${charIndex * 0.05}s`,
                minWidth: char === ' ' ? '20px' : '10px'
              }}
            >
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextDaily());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextDaily());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
      <Text size="md" c="dimmed" ta="center">
        Next round in {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m
      </Text>
  );
};

function Footer() {
  return (
    <Text size="sm" c="dimmed" ta="center" pb="xl">
      Game by <Anchor c="dimmed" style={{ fontWeight: 600 }} href="https://muhashi.com" target="_blank" rel="noopener noreferrer">muhashi</Anchor>.
    </Text>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [gameMode, setGameMode] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dailyCompleted, setDailyCompleted] = useState(() => {
    const saved = localStorage.getItem('dailyCompleted');
    const today = getDaysSinceEpoch();
    if (saved) {
      const data = JSON.parse(saved);
      return data.day === today ? data.completed : false;
    }
    return false;
  });

  const startGame = (mode) => {
    setGameMode(mode);
    setPosts(mode === 'daily' ? getDailyPosts() : getRandomPosts());
    setCurrentIndex(0);
    setUserAnswers([]);
    setShowResult(false);
    setCopied(false);
    setScreen('game');
  };

  const handleGuess = (guess) => {
    const currentPost = posts[currentIndex];
    const isCorrect = guess === currentPost.verdict;
    
    setUserAnswers([...userAnswers, { guess, correct: isCorrect, post: currentPost }]);
    setShowResult(true);
  };

  const nextPost = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
    } else {
      if (gameMode === 'daily') {
        const today = getDaysSinceEpoch();
        localStorage.setItem('dailyCompleted', JSON.stringify({ day: today, completed: true }));
        setDailyCompleted(true);
      }
      setScreen('results');
    }
    window.scrollTo({
      top: 0,
      left: 0,
    });
  };

  const shareResults = () => {
    const correctCount = userAnswers.filter(a => a.correct).length;
    const emoji = userAnswers.map(a => a.correct ? '✅' : '❌').join(' ');
    const text = `AITA Guesser ${getDaysSinceEpoch()} ${correctCount}/3\n${emoji}\n\nPlay AITA Guesser: https://muhashi.com/aita-guesser`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (screen === 'home') {
    return (
      <MantineProvider>
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f5f5f5',
          padding: '20px'
        }}>
          <Container size="sm" style={{ marginTop: '100px' }}>
            <Stack align="center" gap="xl">
              <AnimatedTitle />
              <Text size="xl" ta="center" style={{ fontWeight: 600 }}>
                Can you guess if the poster is the asshole?
              </Text>
              <Text size="lg" ta="center">
                Guess the verdict for over 1000 popular r/AmItheAsshole Reddit posts.
              </Text>
              <Group gap="md" mt="xl" justify='center'>
                <Button 
                  size="xl" 
                  onClick={() => startGame('daily')} 
                  variant="filled"
                  color="orange"
                  disabled={dailyCompleted}
                  style={{ 
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    fontSize: dailyCompleted ? '1rem' : '1.1rem',
                    height: '60px',
                    paddingLeft: '30px',
                    paddingRight: '30px'
                  }}
                >
                  {dailyCompleted ? `Next daily in ${String(getTimeUntilNextDaily().hours).padStart(2, '0')}h ${String(getTimeUntilNextDaily().minutes).padStart(2, '0')}m` : '📅 Daily Challenge'}
                </Button>
                <Button 
                  size="xl" 
                  onClick={() => startGame('quick')} 
                  variant="outline"
                  color="dark"
                  style={{ 
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                    fontSize: '1.1rem',
                    height: '60px',
                    paddingLeft: '30px',
                    paddingRight: '30px',
                    backgroundColor: 'white'
                  }}
                >
                  🎲 Quick Play
                </Button>
              </Group>
              <Footer />
            </Stack>
          </Container>
        </div>
      </MantineProvider>
    );
  }

  if (screen === 'game') {
    const currentPost = posts[currentIndex];
    
    return (
      <MantineProvider>
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f5f5f5',
          padding: '20px'
        }}>
          <Container size="md" style={{ marginTop: '40px' }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Badge size="lg" color="orange" variant="filled" style={{ fontSize: '0.9rem' }}>
                  {gameMode === 'daily' ? '📅 Daily Challenge' : '🎲 Quick Play'}
                </Badge>
                <Badge size="lg" variant="filled" color="gray" style={{ fontSize: '0.9rem' }}>
                  Post {currentIndex + 1} of 3
                </Badge>
              </Group>
              
              <Card shadow="md" padding="lg" radius="md" withBorder style={{ backgroundColor: 'white' }}>
                <Stack gap="md">
                  <Title order={2} size="h3">{currentPost.title}</Title>
                  <Text style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: currentPost.text }} />
                </Stack>
              </Card>

              {!showResult ? (
                <Group justify="center" gap="xl" mt="xl">
                  <Button 
                    size="lg" 
                    color="red" 
                    onClick={() => handleGuess('YTA')}
                    style={{ 
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      height: '60px',
                      fontSize: '1.1rem',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}
                  >
                    YTA (You're The Asshole)
                  </Button>
                  <Button 
                    size="lg" 
                    color="green" 
                    onClick={() => handleGuess('NTA')}
                    style={{ 
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      height: '60px',
                      fontSize: '1.1rem',
                      paddingLeft: '30px',
                      paddingRight: '30px'
                    }}
                  >
                    NTA (Not The Asshole)
                  </Button>
                </Group>
              ) : (
                <Paper p="xl" radius="md" withBorder style={{ backgroundColor: userAnswers[userAnswers.length - 1].correct ? '#d4edda' : '#f8d7da' }}>
                  <Stack gap="md" align="center">
                    <Title order={3}>
                      {userAnswers[userAnswers.length - 1].correct ? '✅ Correct!' : '❌ Incorrect'}
                    </Title>
                    <Text size="lg">
                      The verdict was: <strong>{currentPost.verdict}</strong>
                    </Text>
                    <Button 
                      component="a" 
                      href={`https://redd.it/${currentPost.id}`}
                      target="_blank"
                      variant="subtle"
                    >
                      View Original Post
                    </Button>
                    <Text size="sm" c="dimmed" ta="center">
                      <strong>Note:</strong> The verdict on Reddit may have changed since the data was originally retrieved.
                    </Text>
                    <Button size="lg" onClick={nextPost} mt="md">
                      {currentIndex < posts.length - 1 ? 'Next Post' : 'See Results'}
                    </Button>
                  </Stack>
                </Paper>
              )}
              <Paper p="xl" radius="md" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
                <Text size="sm" c="dimmed" ta="center">
                  <strong>Glossary:</strong>
                  <br />
                  <em>AITA:</em> Am I The Asshole?
                  <br />
                  <em>WIBTA:</em> Would I Be The Asshole?
                </Text>
              </Paper>
              <Footer />
            </Stack>
          </Container>
        </div>
      </MantineProvider>
    );
  }

  if (screen === 'results') {
    const correctCount = userAnswers.filter(a => a.correct).length;
    
    return (
      <MantineProvider>
        { correctCount === 3 && <ConfettiExplosion
          style={{
            position: 'absolute', top: '30vh', left: '50vw',
          }}
          duration={3000}
          force={0.6}
        />}
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f5f5f5',
          padding: '20px'
        }}>
          <Container size="md" style={{ marginTop: '40px' }}>
            <Stack gap="xl" align="center">
              <Title order={1} c="dark" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                Game Complete!
              </Title>
              <Title order={2} c="dark" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                You got {correctCount} out of 3 correct{correctCount === 3 ? ' 🎉' : ''}{correctCount === 0 ? ' 💩' : ''}
              </Title>

              {gameMode === 'daily' && <CountdownTimer />}
              
              <Stack gap="md" style={{ width: '100%' }}>
                {userAnswers.map((answer, idx) => (
                  <Card key={idx} shadow="md" padding="lg" radius="md" withBorder style={{ backgroundColor: 'white' }}>
                    <Group justify="space-between" align="flex-start">
                      <div style={{ flex: 1 }}>
                        <Anchor 
                          href={`https://redd.it/${answer.post.id}`}
                          target="_blank"
                          c="dark"
                          style={{ textDecoration: 'none' }}
                        >
                          <Text fw={500} style={{ textDecoration: 'underline' }}>{answer.post.title}</Text>
                        </Anchor>
                      </div>
                      <Badge color={answer.correct ? 'green' : 'red'}>
                        {answer.correct ? '✅ Correct' : '❌ Wrong'}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mt="xs">
                      Your guess: {answer.guess} | Actual: {answer.post.verdict}
                    </Text>
                  </Card>
                ))}
              </Stack>

              <Group gap="md" justify="center">
                {gameMode === 'daily' ? (
                  <>
                    <Button 
                      size="lg" 
                      onClick={shareResults} 
                      variant="filled"
                      color="orange"
                      style={{ 
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        fontSize: '1.1rem'
                      }}
                    >
                      {copied ? '✓ Copied!' : 'Share Results'}
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={() => startGame('quick')} 
                      variant="outline"
                      color="dark"
                      style={{ 
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                        fontSize: '1.1rem',
                        backgroundColor: 'white'
                      }}
                    >
                      Play Quick Mode
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => startGame('quick')}
                      variant="filled"
                      color="orange"
                      style={{ 
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        fontSize: '1.1rem'
                      }}
                    >
                      Play Again
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={() => setScreen('home')} 
                      variant="outline"
                      color="dark"
                      style={{ 
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                        fontSize: '1.1rem',
                        backgroundColor: 'white'
                      }}
                    >
                      Back to Home
                    </Button>
                  </>
                )}
              </Group>
              <Footer />
            </Stack>
          </Container>
        </div>
      </MantineProvider>
    );
  }
}

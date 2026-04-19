import React, { useState, useEffect, Suspense, use } from 'react';
import { ActionIcon, useMantineColorScheme, useComputedColorScheme, Container, Flex, Title, Button, Card, Text, Group, Stack, Badge, Paper, Anchor } from '@mantine/core';
import DATASET from './dataset.json';
import ConfettiExplosion from 'react-confetti-blast';
import VerdictChart from './VerdictChart';
import { IconSun, IconMoonStars, IconArrowRight, IconDice5Filled, IconCalendarFilled } from '@tabler/icons-react';
import './App.css';

const verdicts = import('./verdicts.json');

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

const ColorSchemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const dark = computedColorScheme === 'dark';
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ActionIcon className="hover-animate-color" onClick={toggleColorScheme} size="lg" variant="default" style={{ backgroundColor: dark ? '#1a1b1c' : '#f5f5f5' }}>
      {computedColorScheme === 'dark' ? <IconMoonStars size={18} /> : <IconSun size={18} />}
    </ActionIcon>
  );
}

const AnimatedTitle = () => {
  const computedColorScheme = useComputedColorScheme('light');
  const dark = computedColorScheme === 'dark';
  const [animate, setAnimate] = useState(false);
  const words = ['AITA', 'Guesser'];
  const colors = [dark ? '#e35d4b' : '#e55643', dark ? '#3dcc7c' : '#2b9f5e'];


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
      Next round in {String(timeLeft.hours)}h {String(timeLeft.minutes)}m
    </Text>
  );
};

function Footer() {
  return (
    <Group gap="md" pt="md" pb="xl" justify="center">
      <Text size="sm" c="dimmed" ta="center">
        Game by <Anchor c="dimmed" style={{ fontWeight: 600 }} href="https://muhashi.com" target="_blank" rel="noopener noreferrer">muhashi</Anchor>.
      </Text>
      <a href='https://ko-fi.com/D1D5V1DSF' target='_blank' className="hover-animate">
        <img height='36' style={{ border: 0, height: '36px' }} src='https://storage.ko-fi.com/cdn/kofi6.png?v=3' alt='Buy Me a Coffee at ko-fi.com' />
      </a>
    </Group>
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

  const computedColorScheme = useComputedColorScheme('light');
  const dark = computedColorScheme === 'dark';
  const verdictsLoaded = use(verdicts);

  const correctBg = dark ? '#15663a' : '#d4edda';
  const incorrectBg = dark ? '#8c281b' : '#f8d7da';

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
      <div style={{
        minHeight: '100vh',
        backgroundColor: dark ? '#1a1b1c' : '#f5f5f5',
        padding: '20px'
      }}>
        <Container size="sm" style={{ marginTop: '65px' }}>
          <Flex justify="flex-end">
            <ColorSchemeToggle />
          </Flex>
          <Stack align="center" gap="xl">
            <AnimatedTitle />
            <Text size="xl" ta="center" style={{ fontWeight: 600 }}>
              Can you guess if the Redditor is the asshole?
            </Text>
            <Text size="lg" ta="center">
              Guess the verdict for popular r/AmItheAsshole Reddit posts.
            </Text>
            <Group gap="md" mt="xl" justify='center'>
              <Button
                className={dailyCompleted ? "" : "hover-animate"}
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
                {!dailyCompleted && <IconCalendarFilled style={{ marginRight: '8px' }} />}
                {dailyCompleted ? `Next daily in ${String(getTimeUntilNextDaily().hours)}h ${String(getTimeUntilNextDaily().minutes)}m` : 'Daily Challenge'}
              </Button>
              <Button
                className="hover-animate"
                size="xl"
                onClick={() => startGame('quick')}
                variant="default"
                color="white"
                style={{
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  fontSize: '1.1rem',
                  height: '60px',
                  paddingLeft: '30px',
                  paddingRight: '30px',
                }}
              >
                <IconDice5Filled className="hover-animate-dice" style={{ marginRight: '8px' }} />
                Quick Play
              </Button>
            </Group>
            <Footer />
          </Stack>
        </Container>
      </div>
    );
  }

  if (screen === 'game') {
    const currentPost = posts[currentIndex];

    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: dark ? '#1a1b1c' : '#f5f5f5',
        padding: '20px',
      }}>
        <Container size="md" style={{ marginTop: '15px' }}>
          <Stack gap="md">
            <Group justify="space-between">
              <Badge size="lg" color="orange" variant="filled" style={{ fontSize: '0.9rem', userSelect: 'none' }}>
                {gameMode === 'daily' ? '📅 Daily Challenge' : '🎲 Quick Play'}
              </Badge>
              <Flex gap="md" align="center">
                <Badge size="lg" variant="filled" color="gray" style={{ fontSize: '0.9rem', userSelect: 'none' }}>
                  Post {currentIndex + 1} of 3
                </Badge>
                <ColorSchemeToggle />
              </Flex>
            </Group>

            <Card shadow="md" padding="lg" pb="xs" radius="md" withBorder style={{ backgroundColor: dark ? '#1a1b1c' : '#f5f5f5' }}>
              <Stack gap="0">
                <Title order={2} fz={{ base: 'h3', sm: 'h2' }}>{currentPost.title}</Title>
                <Text fz={{ base: 'md', sm: 'lg' }} dangerouslySetInnerHTML={{ __html: currentPost.text }} />
              </Stack>
            </Card>

            {!showResult ? (
              <Group justify="center" gap="xl" mt="xl">
                <Button
                  className="hover-animate"
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
                  className="hover-animate"
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
              <Paper p="xl" radius="md" withBorder style={{ backgroundColor: userAnswers[userAnswers.length - 1].correct ? correctBg : incorrectBg }}>
                <Stack gap="md" align="center">
                  <Title order={3}>
                    {userAnswers[userAnswers.length - 1].correct ? '✅ Correct!' : '❌ Incorrect'}
                  </Title>
                  <Text size="lg" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '6px' }}>
                    The verdict was: <Badge variant="filled" color={currentPost.verdict === 'NTA' ? 'green' : 'red'}><strong>{currentPost.verdict}</strong></Badge>
                  </Text>
                  <Suspense fallback={<Text size="sm">Loading verdict breakdown...</Text>}>
                    <VerdictChart postId={currentPost.id} verdicts={verdictsLoaded} />
                  </Suspense>
                  <Group gap="md" justify="center" align='center'>
                    <Button
                      className="hover-animate"
                      component="a"
                      href={`https://redd.it/${currentPost.id}`}
                      target="_blank"
                      variant="subtle"
                    >
                      View Original Post
                    </Button>
                    <Button size="lg" onClick={nextPost} className="hover-animate">
                      {currentIndex < posts.length - 1 ? ('Next Post ') : 'See Results'}
                      {currentIndex < posts.length - 1 && <IconArrowRight className="hover-animate-right-arrow" size={18} style={{ marginLeft: '5px' }} />}
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            )}
            {/* <Paper p="xl" radius="md" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
                <Text size="sm" c="dimmed" ta="center">
                  <strong>Glossary:</strong>
                  <br />
                  <em>AITA:</em> Am I The Asshole?
                  <br />
                  <em>WIBTA:</em> Would I Be The Asshole?
                </Text>
              </Paper> */}
            <Footer />
          </Stack>
        </Container>
      </div>
    );
  }

  if (screen === 'results') {
    const correctCount = userAnswers.filter(a => a.correct).length;

    return (
      <>
        {correctCount === 3 && <ConfettiExplosion
          style={{
            position: 'absolute', top: '30vh', left: '50vw',
          }}
          duration={3000}
          force={0.6}
        />}
        <div style={{
          minHeight: '100vh',
          backgroundColor: dark ? '#1a1b1c' : '#f5f5f5',
          padding: '20px'
        }}>
          <Container size="md" style={{ marginTop: '10px' }}>
            <Flex justify="flex-end">
              <ColorSchemeToggle />
            </Flex>
            <Stack gap="xl" align="center">
              <Title order={1}>
                Results
              </Title>
              <Title order={2}>
                You got {correctCount} out of 3 correct{correctCount === 3 ? ' 🎉' : ''}{correctCount === 0 ? ' 💩' : ''}
              </Title>

              {gameMode === 'daily' && <CountdownTimer />}

              <Stack gap="md" style={{ width: '100%' }}>
                {userAnswers.map((answer, idx) => (
                  <Card key={idx} shadow="md" padding="lg" radius="md" withBorder style={{ backgroundColor: dark ? '#1a1b1c' : '#f5f5f5' }}>
                    <Group justify="space-between" align="flex-start">
                      <div style={{ flex: 1 }}>
                        <Anchor
                          href={`https://redd.it/${answer.post.id}`}
                          target="_blank"
                          c={dark ? 'white' : 'dark'}
                          style={{ textDecoration: 'none' }}
                        >
                          <Text fw={500} style={{ textDecoration: 'underline' }} fz={{ base: 'md', sm: 'lg' }}>
                            {answer.post.title}
                          </Text>
                        </Anchor>
                      </div>
                      <Badge color={answer.correct ? 'green' : 'red'}>
                        {answer.correct ? '✅ Correct' : '❌ Wrong'}
                      </Badge>
                    </Group>
                    <Text size="sm" c={dark ? 'white' : 'dark'} mt="xs">
                      Your guess: {answer.guess} | Actual: {answer.post.verdict}
                    </Text>
                  </Card>
                ))}
              </Stack>

              <Group gap="md" justify="center">
                {gameMode === 'daily' ? (
                  <>
                    <Button
                      className="hover-animate"
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
                      className="hover-animate"
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
                      className="hover-animate"
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
                      className="hover-animate"
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
                      Home
                    </Button>
                  </>
                )}
              </Group>
              <Footer />
            </Stack>
          </Container>
        </div>
      </>
    );
  }
}

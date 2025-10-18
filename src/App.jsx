import React, { useState } from 'react';
import { MantineProvider, Container, Title, Button, Card, Text, Group, Stack, Badge, Paper, Anchor } from '@mantine/core';
import DATASET from './dataset.json';


function getDaysSinceEpoch() {
  const now = new Date();
  const epoch = new Date('2025-10-18');
  const diff = now - epoch;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
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
  const shuffled = [...DATASET].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function Footer() {
  return (
    <Text size="sm" c="dimmed" align="center">
      Game by <Anchor href="https://muhashi.com" target="_blank" rel="noopener noreferrer">muhashi</Anchor>.
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

  const startGame = (mode) => {
    setGameMode(mode);
    setPosts(mode === 'daily' ? getDailyPosts() : getRandomPosts());
    setCurrentIndex(0);
    setUserAnswers([]);
    setShowResult(false);
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
      setScreen('results');
    }
  };

  const shareResults = () => {
    const correctCount = userAnswers.filter(a => a.correct).length;
    const emoji = userAnswers.map(a => a.correct ? '✅' : '❌').join(' ');
    const text = `AITA Guesser\n${correctCount}/3 correct\n${emoji}\n\nPlay AITA Guesser: https://muhashi.com/aita-guesser`;
    
    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  if (screen === 'home') {
    return (
      <MantineProvider>
        <Container size="sm" style={{ marginTop: '100px' }}>
          <Stack align="center" gap="xl">
            <Title order={1} style={{ fontSize: '3rem' }}>AITA Guesser</Title>
            <Text size="lg" c="dimmed" ta="center">
              Can you guess if the poster is the asshole?
            </Text>
            <Group gap="md" mt="xl">
              <Button size="xl" onClick={() => startGame('daily')} variant="filled">
                Daily Challenge
              </Button>
              <Button size="xl" onClick={() => startGame('quick')} variant="outline">
                Quick Play
              </Button>
            </Group>
            <Footer />
          </Stack>
        </Container>
      </MantineProvider>
    );
  }

  if (screen === 'game') {
    const currentPost = posts[currentIndex];
    
    return (
      <MantineProvider>
        <Container size="md" style={{ marginTop: '40px' }}>
          <Stack gap="md">
            <Group justify="space-between">
              <Badge size="lg">{gameMode === 'daily' ? 'Daily Challenge' : 'Quick Play'}</Badge>
              <Badge size="lg" variant="outline">Post {currentIndex + 1} of 3</Badge>
            </Group>
            
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={2} size="h3">{currentPost.title}</Title>
                <Text style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: currentPost.text }} />
              </Stack>
            </Card>

            {!showResult ? (
              <Group justify="center" gap="xl" mt="xl">
                <Button size="lg" color="red" onClick={() => handleGuess('YTA')}>
                  YTA (You're The Asshole)
                </Button>
                <Button size="lg" color="green" onClick={() => handleGuess('NTA')}>
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
                  <Button size="lg" onClick={nextPost} mt="md">
                    {currentIndex < posts.length - 1 ? 'Next Post' : 'See Results'}
                  </Button>
                </Stack>
              </Paper>
            )}
            <Paper p="md" mt="xl" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
              <Text size="sm" c="dimmed" align="center">
                <strong>Glossary:</strong>
                <br />
                <em>YTA:</em> You're The Asshole
                <br />
                <em>NTA:</em> Not The Asshole
                <br />
                <em>WIBTA:</em> Would I Be The Asshole
              </Text>
            </Paper>
            <Footer />
          </Stack>
        </Container>
      </MantineProvider>
    );
  }

  if (screen === 'results') {
    const correctCount = userAnswers.filter(a => a.correct).length;
    
    return (
      <MantineProvider>
        <Container size="md" style={{ marginTop: '40px' }}>
          <Stack gap="xl" align="center">
            <Title order={1}>Game Complete!</Title>
            <Title order={2}>You got {correctCount} out of 3 correct</Title>
            
            <Stack gap="md" style={{ width: '100%' }}>
              {userAnswers.map((answer, idx) => (
                <Card key={idx} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <Text fw={500}>{answer.post.title}</Text>
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

            <Group gap="md" mt="xl">
              {gameMode === 'daily' && (
                <Button size="lg" onClick={shareResults} variant="filled">
                  Share Results
                </Button>
              )}
              <Button size="lg" onClick={() => setScreen('home')} variant="outline">
                Back to Home
              </Button>
              {gameMode === 'quick' && (
                <Button size="lg" onClick={() => startGame('quick')}>
                  Play Again
                </Button>
              )}
            </Group>
            <Footer />
          </Stack>
        </Container>
      </MantineProvider>
    );
  }
}

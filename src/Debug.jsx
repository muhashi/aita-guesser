import React, { useState } from 'react';
import { Container, NumberInput, Title, Button, Card, Text, Group, Stack, Badge, Paper, Anchor } from '@mantine/core';
import DATASET from './dataset.json';
import { IconArrowRight } from '@tabler/icons-react';
import './App.css';

// Just to make sure posts display correctly
const Debug = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentPost = DATASET[currentIndex];
    const dark = true;
    const showResult = true;

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
                  🎲 Quick Play
                </Badge>
                <Badge size="lg" variant="filled" color="gray" style={{ fontSize: '0.9rem', userSelect: 'none' }}>
                Post <NumberInput value={currentIndex + 1} onChange={(value) => setCurrentIndex(Math.max(0, Math.min(value - 1, DATASET.length - 1)))} /> of {DATASET.length}
                </Badge>
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
                    // onClick={() => handleGuess('YTA')}
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
                    // onClick={() => handleGuess('NTA')}
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
                <Paper p="xl" radius="md" withBorder>
                  <Stack gap="md" align="center">
                    <Title order={3}>
                      ✅ Correct!
                    </Title>
                    <Text size="lg" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '6px' }}>
                      The verdict was: <Badge variant="filled" color={currentPost.verdict === 'NTA' ? 'green' : 'red'}><strong>{currentPost.verdict}</strong></Badge>
                    </Text>
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
                    <Button size="lg" onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, DATASET.length - 1))} className="hover-animate">
                      {currentIndex < DATASET.length - 1 && ('Next Post ')}
                      { currentIndex < DATASET.length - 1 && <IconArrowRight className="hover-animate-right-arrow" size={18} style={{ marginLeft: '5px' }} /> }
                    </Button>
                    </Group>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Container>
        </div>
    );
};

export default Debug;
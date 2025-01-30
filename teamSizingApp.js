import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Users, TrendingUp, RotateCcw, Timer, MessageSquare, Download, BarChart2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TeamSizingApp = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [currentSize, setCurrentSize] = useState('');
  const [currentComment, setCurrentComment] = useState('');
  const [currentConfidence, setCurrentConfidence] = useState(3);
  const [revealed, setRevealed] = useState(false);
  const [selectedScale, setSelectedScale] = useState('fibonacci');
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(180);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [showChart, setShowChart] = useState(false);

  const scales = {
    fibonacci: ['1', '2', '3', '5', '8', '13', '21'],
    points: ['1', '2', '4', '8', '16', '32'],
  };

  const scaleValues = {
    fibonacci: { '1': 1, '2': 2, '3': 3, '5': 5, '8': 8, '13': 13, '21': 21 },
    points: { '1': 1, '2': 2, '4': 4, '8': 8, '16': 16, '32': 32 },
  };

  const confidenceLevels = [
    'Very Uncertain',
    'Somewhat Uncertain',
    'Neutral',
    'Somewhat Confident',
    'Very Confident'
  ];

  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
      setRevealed(true);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const handleSubmit = () => {
    if (currentName && currentSize && teamMembers.length < 10) {
      setTeamMembers([...teamMembers, { 
        name: currentName, 
        size: currentSize,
        sizeValue: scaleValues[selectedScale][currentSize],
        comment: currentComment,
        confidence: currentConfidence
      }]);
      setCurrentName('');
      setCurrentSize('');
      setCurrentComment('');
      setCurrentConfidence(3);
    }
  };

  const reset = () => {
    setTeamMembers([]);
    setCurrentName('');
    setCurrentSize('');
    setCurrentComment('');
    setCurrentConfidence(3);
    setRevealed(false);
    setTimerActive(false);
    setTimeRemaining(timerDuration);
    setShowChart(false);
    setCurrentTopic('');
  };

  const startTimer = () => {
    if (!currentTopic.trim()) {
      alert('Please enter a topic for the sizing round');
      return;
    }
    setTimerActive(true);
    setRevealed(false);
  };

  const calculateStats = () => {
    if (teamMembers.length === 0) return { average: 0, median: 0, mode: 0 };
    
    const values = teamMembers.map(member => member.sizeValue);
    values.sort((a, b) => a - b);
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = (sum / values.length).toFixed(1);
    
    const median = values.length % 2 === 0
      ? (values[values.length/2 - 1] + values[values.length/2]) / 2
      : values[Math.floor(values.length/2)];
    
    const frequency = {};
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    const mode = Object.entries(frequency)
      .reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    return { average, median, mode };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportData = () => {
    const data = {
      topic: currentTopic,
      teamMembers,
      statistics: calculateStats(),
      scale: selectedScale,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sizing-${currentTopic.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    const frequency = {};
    teamMembers.forEach(member => {
      frequency[member.size] = (frequency[member.size] || 0) + 1;
    });
    return Object.entries(frequency).map(([size, count]) => ({
      size,
      count
    }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          Team Workload Sizing ({teamMembers.length}/10 members)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Topic Input */}
          <Input
            placeholder="What are we sizing? (e.g., 'User Authentication Feature')"
            value={currentTopic}
            onChange={(e) => setCurrentTopic(e.target.value)}
            className="w-full"
            disabled={timerActive || teamMembers.length > 0}
          />

          {/* Scale and Timer Controls */}
          <div className="flex gap-2">
            <Select value={selectedScale} onValueChange={setSelectedScale}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select scale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fibonacci">Fibonacci</SelectItem>
                <SelectItem value="points">Story Points</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={timerDuration.toString()} 
              onValueChange={(val) => {
                setTimerDuration(Number(val));
                setTimeRemaining(Number(val));
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Timer duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
                <SelectItem value="180">3 minutes</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={startTimer}
              disabled={timerActive || revealed || !currentTopic.trim()}
              className="flex items-center gap-2"
            >
              <Timer className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </Button>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Your name"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                className="flex-1"
                disabled={teamMembers.length >= 10}
              />
              <div className="flex gap-2">
                {scales[selectedScale].map((size) => (
                  <Button
                    key={size}
                    variant={currentSize === size ? "default" : "outline"}
                    onClick={() => setCurrentSize(size)}
                    className="w-12"
                    disabled={teamMembers.length >= 10}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Confidence:</span>
                <Slider
                  value={[currentConfidence]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([value]) => setCurrentConfidence(value)}
                  className="w-48"
                />
                <span className="text-sm">{confidenceLevels[currentConfidence - 1]}</span>
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment (optional)"
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  className="flex-1"
                  rows={1}
                />
                <Button 
                  onClick={handleSubmit}
                  disabled={!currentName || !currentSize || teamMembers.length >= 10}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Team Members List */}
          <div className="space-y-2">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <div className="flex-1">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">
                    Confidence: {confidenceLevels[member.confidence - 1]}
                  </div>
                  {member.comment && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {member.comment}
                    </div>
                  )}
                </div>
                <span className="font-mono">
                  {revealed ? member.size : '?'}
                </span>
              </div>
            ))}
          </div>

          {/* Visualization */}
          {revealed && teamMembers.length > 0 && showChart && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <XAxis dataKey="size" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setRevealed(!revealed)}
                disabled={teamMembers.length === 0}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {revealed ? 'Hide Sizes' : 'Reveal Sizes'}
              </Button>
              
              {revealed && teamMembers.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowChart(!showChart)}
                    className="flex items-center gap-2"
                  >
                    <BarChart2 className="h-4 w-4" />
                    {showChart ? 'Hide Chart' : 'Show Chart'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={exportData}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </>
              )}
            </div>
            
            {revealed && teamMembers.length > 0 && (
              <div className="text-sm space-y-1">
                <div>Average: {calculateStats().average}</div>
                <div>Median: {calculateStats().median}</div>
                <div>Mode: {calculateStats().mode}</div>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSizingApp;

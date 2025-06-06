
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, CheckCircle, Clock, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PostCallFollowUpProps {
  callId: string;
  startup: string;
  mentor: string;
  date: string;
  userRole: 'startup' | 'mentor';
}

const PostCallFollowUp: React.FC<PostCallFollowUpProps> = ({
  callId,
  startup,
  mentor,
  date,
  userRole
}) => {
  const [followUpQuestions, setFollowUpQuestions] = useState('');
  const [adviceResult, setAdviceResult] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmitFollowUp = () => {
    toast({
      title: "Follow-up Submitted",
      description: "Your post-call follow-up has been saved and shared.",
    });
    
    // Reset form
    setFollowUpQuestions('');
    setAdviceResult('');
    setNextSteps('');
    setFeedback('');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Post-Call Follow-Up</span>
        </CardTitle>
        <CardDescription>
          Session between {startup} and {mentor} on {date}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
          <Avatar>
            <AvatarFallback>{startup[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{startup}</p>
            <p className="text-sm text-muted-foreground">with {mentor}</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {userRole === 'startup' ? 'Your View' : 'Mentor View'}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="follow-up-questions">Follow-up Questions</Label>
            <Textarea
              id="follow-up-questions"
              placeholder={
                userRole === 'startup' 
                  ? "Any additional questions that came up after the call?"
                  : "Questions you'd like the startup to consider?"
              }
              value={followUpQuestions}
              onChange={(e) => setFollowUpQuestions(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="advice-result">Result of Advice Given</Label>
            <Textarea
              id="advice-result"
              placeholder={
                userRole === 'startup'
                  ? "How did you implement the advice? What were the results?"
                  : "Expected outcomes from the advice provided"
              }
              value={adviceResult}
              onChange={(e) => setAdviceResult(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="next-steps">Action Items / Next Steps</Label>
            <Textarea
              id="next-steps"
              placeholder="What are the concrete next steps to be taken?"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="feedback">Session Feedback</Label>
            <Textarea
              id="feedback"
              placeholder={
                userRole === 'startup'
                  ? "How helpful was this session? Any feedback for the mentor?"
                  : "How engaged was the startup? Any observations?"
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              This will be shared with both startup and mentor
            </span>
          </div>
          <Button onClick={handleSubmitFollowUp}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit Follow-Up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCallFollowUp;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CallSchedulerProps {
  userRole: 'startup' | 'mentor';
  onScheduleCall?: (date: Date, time: string, participant: string) => void;
}

const CallScheduler: React.FC<CallSchedulerProps> = ({ userRole, onScheduleCall }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const mockParticipants = userRole === 'startup' 
    ? ['John Smith (Mentor)', 'Sarah Johnson (Mentor)', 'Mike Davis (Mentor)']
    : ['TechStart Inc.', 'InnovateLab', 'StartupX', 'NextGen Solutions'];

  const upcomingCalls = [
    {
      date: '2024-01-15',
      time: '14:00',
      participant: userRole === 'startup' ? 'John Smith (Mentor)' : 'TechStart Inc.',
      status: 'confirmed'
    },
    {
      date: '2024-01-18',
      time: '10:00',
      participant: userRole === 'startup' ? 'Sarah Johnson (Mentor)' : 'InnovateLab',
      status: 'pending'
    }
  ];

  const handleScheduleCall = () => {
    if (selectedDate && selectedTime && selectedParticipant) {
      onScheduleCall?.(selectedDate, selectedTime, selectedParticipant);
      // Reset form
      setSelectedTime('');
      setSelectedParticipant('');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar and Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <CalendarIcon className="h-5 w-5" />
            <span>Schedule New Call</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>
          
          {selectedDate && (
            <>
              <div>
                <h4 className="font-medium mb-2">Available Time Slots</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className={selectedTime === time ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">
                  Select {userRole === 'startup' ? 'Mentor' : 'Startup'}
                </h4>
                <div className="space-y-2">
                  {mockParticipants.map((participant) => (
                    <Button
                      key={participant}
                      variant={selectedParticipant === participant ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedParticipant(participant)}
                      className={`w-full justify-start ${
                        selectedParticipant === participant ? "bg-orange-500 hover:bg-orange-600" : ""
                      }`}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {participant}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleScheduleCall}
                disabled={!selectedTime || !selectedParticipant}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Schedule Call
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <Clock className="h-5 w-5" />
            <span>Upcoming Calls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingCalls.map((call, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{call.participant}</div>
                  <Badge variant={call.status === 'confirmed' ? 'default' : 'secondary'}>
                    {call.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center space-x-4">
                  <span className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4 text-orange-500" />
                    {format(new Date(call.date), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-orange-500" />
                    {call.time}
                  </span>
                </div>
                <div className="mt-2 flex space-x-2">
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallScheduler;

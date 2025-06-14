
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SchedulingRule {
  id: string;
  mentor_type: 'founder_mentor' | 'expert' | 'coach';
  advance_booking_weeks: number;
  slot_creation_window_weeks: number;
  min_advance_booking_hours: number;
  max_advance_booking_days: number;
  max_sessions_per_week: number;
  default_duration_minutes: number;
  allow_recurring: boolean;
}

interface MentorToggle {
  mentor_type: 'founder_mentor' | 'expert' | 'coach';
  is_visible: boolean;
}

interface BookingWindow {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export const useSchedulingRules = () => {
  const [schedulingRules, setSchedulingRules] = useState<SchedulingRule[]>([]);
  const [mentorToggles, setMentorToggles] = useState<MentorToggle[]>([]);
  const [bookingWindows, setBookingWindows] = useState<BookingWindow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedulingData();
  }, []);

  const fetchSchedulingData = async () => {
    try {
      // Fetch scheduling rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('scheduling_rules')
        .select('*');

      if (rulesError) throw rulesError;

      // Fetch mentor toggles
      const { data: togglesData, error: togglesError } = await supabase
        .from('mentor_toggles')
        .select('mentor_type, is_visible');

      if (togglesError) throw togglesError;

      // Fetch booking windows
      const { data: windowsData, error: windowsError } = await supabase
        .from('booking_windows')
        .select('*')
        .eq('is_active', true);

      if (windowsError) throw windowsError;

      setSchedulingRules(rulesData || []);
      setMentorToggles(togglesData || []);
      setBookingWindows(windowsData || []);
    } catch (error) {
      console.error('Error fetching scheduling data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRuleForMentorType = (mentorType: 'founder_mentor' | 'expert' | 'coach') => {
    return schedulingRules.find(rule => rule.mentor_type === mentorType);
  };

  const isMentorTypeVisible = (mentorType: 'founder_mentor' | 'expert' | 'coach') => {
    const toggle = mentorToggles.find(t => t.mentor_type === mentorType);
    return toggle?.is_visible ?? true;
  };

  const isWithinBookingWindow = () => {
    if (bookingWindows.length === 0) return true; // If no windows defined, always allow

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS format

    return bookingWindows.some(window => {
      return window.day_of_week === currentDay && 
             currentTime >= window.start_time && 
             currentTime <= window.end_time;
    });
  };

  const canCreateSlot = (mentorType: 'founder_mentor' | 'expert' | 'coach', targetDate: Date) => {
    const rule = getRuleForMentorType(mentorType);
    if (!rule) return false;

    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + (rule.slot_creation_window_weeks * 7));

    return targetDate <= maxDate;
  };

  const canBookSlot = (mentorType: 'founder_mentor' | 'expert' | 'coach', slotDate: Date) => {
    if (!isMentorTypeVisible(mentorType)) return false;
    if (!isWithinBookingWindow()) return false;

    const rule = getRuleForMentorType(mentorType);
    if (!rule) return false;

    const now = new Date();
    const minDate = new Date();
    minDate.setHours(now.getHours() + rule.min_advance_booking_hours);

    const maxDate = new Date();
    maxDate.setDate(now.getDate() + rule.max_advance_booking_days);

    return slotDate >= minDate && slotDate <= maxDate;
  };

  const getAdvanceBookingWeeks = (mentorType: 'founder_mentor' | 'expert' | 'coach') => {
    const rule = getRuleForMentorType(mentorType);
    return rule?.advance_booking_weeks ?? 1;
  };

  return {
    schedulingRules,
    mentorToggles,
    bookingWindows,
    loading,
    getRuleForMentorType,
    isMentorTypeVisible,
    isWithinBookingWindow,
    canCreateSlot,
    canBookSlot,
    getAdvanceBookingWeeks,
    refetch: fetchSchedulingData
  };
};

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay } from 'date-fns';
import { calendarApi } from '@/lib/api';

interface CalendarEvent {
  id: string;
  date: Date;
  platform: string;
  title: string;
  status: 'scheduled' | 'posted' | 'pending';
  time: string;
}

const platformColors: Record<string, string> = {
  youtube: 'bg-red-500',
  tiktok: 'bg-gray-900',
  instagram: 'bg-pink-500',
  facebook: 'bg-blue-600',
  twitter: 'bg-black',
  linkedin: 'bg-blue-700',
};

const platformIcons: Record<string, string> = {
  youtube: '▶️',
  tiktok: '🎵',
  instagram: '📷',
  facebook: '👥',
  twitter: '🐦',
  linkedin: '💼',
};

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (month: Date) => {
    try {
      setLoading(true);
      setError(null);
      const monthStr = format(month, 'yyyy-MM');
      const data = await calendarApi.getEvents(monthStr);
      const mapped: CalendarEvent[] = data.map(e => ({
        id: e.id,
        date: e.date ? new Date(e.date) : new Date(),
        platform: e.platform,
        title: e.title,
        status: (e.status ?? 'pending') as CalendarEvent['status'],
        time: e.time,
      }));
      setEvents(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(currentMonth);
  }, [currentMonth, fetchEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const startDay = getDay(monthStart);

  // Generate empty cells for days before the start of the month
  const emptyCells = Array.from({ length: startDay }, (_, i) => i);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-slate-400 mb-3">{error}</p>
          <Button onClick={() => fetchEvents(currentMonth)} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center text-lg">
          <CalendarIcon className="w-5 h-5 mr-2 text-violet-600" />
          Content Calendar
          {loading && <RefreshCw className="w-4 h-4 ml-2 animate-spin text-violet-400" />}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells */}
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="h-20 bg-gray-50 rounded-lg" />
          ))}

          {/* Days */}
          {daysInMonth.map((date) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isTodayDate = isToday(date);
            const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

            return (
              <div
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
                  h-20 p-1 rounded-lg border cursor-pointer transition-all
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isTodayDate ? 'border-violet-500 ring-1 ring-violet-500' : 'border-gray-100'}
                  ${isSelected ? 'bg-violet-50 border-violet-300' : 'hover:border-violet-200'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                    ${isTodayDate ? 'bg-violet-600 text-white' : 'text-gray-700'}
                  `}>
                    {format(date, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-violet-600 font-medium">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event indicators */}
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={`
                        text-[10px] px-1 py-0.5 rounded truncate flex items-center
                        ${platformColors[event.platform] || 'bg-gray-400'} text-white
                      `}
                    >
                      <span className="mr-0.5">{platformIcons[event.platform]}</span>
                      <span className="truncate">{event.time}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected date details */}
        {selectedDate && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                Close
              </Button>
            </div>
            
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-gray-500">No content scheduled for this day.</p>
            ) : (
              <div className="space-y-2">
                {getEventsForDate(selectedDate).map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{platformIcons[event.platform]}</span>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant={event.status === 'posted' ? 'default' : 'outline'}>
                      {event.status === 'posted' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {event.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1" />
            <span>YouTube</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-900 mr-1" />
            <span>TikTok</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-500 mr-1" />
            <span>Instagram</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-600 mr-1" />
            <span>Facebook</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-black mr-1" />
            <span>Twitter</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-700 mr-1" />
            <span>LinkedIn</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

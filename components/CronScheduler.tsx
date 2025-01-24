import { useState } from 'react';

interface CronSchedulerProps {
  initialValue?: string;
  onScheduleChange: (schedule: string) => void;
}

type PresetOption = {
  label: string;
  value: string;
  description: string;
};

const PRESET_OPTIONS: PresetOption[] = [
  { label: 'Every 10 minutes', value: '*/10 * * * *', description: 'Extract new data every 10 minutes' },
  { label: 'Every hour', value: '0 * * * *', description: 'Extract new data every hour' },
  { label: 'Every 6 hours', value: '0 */6 * * *', description: 'Extract new data every 6 hours' },
  { label: 'Every 12 hours', value: '0 */12 * * *', description: 'Extract new data every 12 hours' },
  { label: 'Every day', value: '0 0 * * *', description: 'Extract new data every day' },
  { label: 'Every 2 weeks', value: '0 0 */14 * *', description: 'Extract new data every 2 weeks' },
  { label: 'Every week', value: '0 0 * * 0', description: 'Extract new data every week' },
  { label: 'Every 2 weeks', value: '0 0 1,15 * *', description: 'Extract new data twice a month' },
  { label: 'Every month', value: '0 0 1 * *', description: 'Extract new data every month' }
];

export function CronScheduler({ initialValue = '0 0 * * *', onScheduleChange }: CronSchedulerProps) {
  const [selectedPreset, setSelectedPreset] = useState(() => {
    const preset = PRESET_OPTIONS.find(option => option.value === initialValue);
    return preset ? preset.value : initialValue;
  });

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    onScheduleChange(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Update Schedule</h3>
        <p className="text-sm text-white/60 mb-6">How often should Firecrawl extract new data from your sources?</p>
        
        <div className="grid grid-cols-3 gap-6">
          {PRESET_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`relative flex flex-col h-24 px-6 py-4 rounded-xl cursor-pointer transition-all ${
                selectedPreset === option.value
                  ? 'bg-emerald-500/20 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex flex-col h-full">
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={selectedPreset === option.value}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-start justify-between">
                  <div className="text-sm font-medium text-white">{option.label}</div>
                  {selectedPreset === option.value && (
                    <div className="text-emerald-500 -mt-1 -mr-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-white/60 flex-grow">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

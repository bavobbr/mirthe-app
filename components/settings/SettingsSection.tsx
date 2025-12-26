import React from 'react';
import { Button } from '../Button';
import { Gender, WeatherCondition } from '../../types';

interface SettingsSectionProps {
    gender: Gender;
    setGender: (gender: Gender) => void;
    weather: WeatherCondition;
    setWeather: (weather: WeatherCondition) => void;
    t: {
        bgMain: string;
        borderMain: string;
        textMain: string;
        iconBg: string;
        textAccent: string;
    };
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
    gender,
    setGender,
    weather,
    setWeather,
    t,
}) => {
    return (
        <section className={`${t.bgMain} p-6 rounded-3xl shadow-sm border ${t.borderMain} transition-all duration-300`}>
            <h2 className={`text-xl font-bold ${t.textMain} mb-4 flex items-center gap-2`}>
                <span className={`${t.iconBg} p-2 rounded-lg`}>✨</span> Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex gap-2">
                        <Button
                            theme={gender}
                            variant={gender === 'girl' ? 'primary' : 'outline'}
                            onClick={() => setGender('girl')}
                            className="flex-1 text-sm py-2"
                        >
                            👧 Girl
                        </Button>
                        <Button
                            theme={gender}
                            variant={gender === 'boy' ? 'primary' : 'outline'}
                            onClick={() => setGender('boy')}
                            className="flex-1 text-sm py-2"
                        >
                            👦 Boy
                        </Button>
                    </div>
                </div>
                <div>
                    <select
                        className={`w-full border-2 ${gender === 'girl' ? 'border-rose-50' : 'border-blue-50'} rounded-full px-4 py-2 text-sm focus:outline-none bg-white ${t.textAccent} font-medium transition-colors`}
                        value={weather.condition}
                        onChange={(e) => setWeather({ condition: e.target.value })}
                    >
                        <option value="Random">🌡️ Any Weather</option>
                        <option value="Sunny">☀️ Sunny</option>
                        <option value="Rainy">🌧️ Rainy</option>
                        <option value="Snowy">❄️ Snowy</option>
                        <option value="Cloudy">☁️ Cloudy</option>
                        <option value="Windy">💨 Windy</option>
                    </select>
                </div>
            </div>
        </section>
    );
};

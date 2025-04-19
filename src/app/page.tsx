"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const moodEmojis = [
    { value: 'happy', label: '😄', color: '#FFDA63' },
    { value: 'sad', label: '😢', color: '#70A1FF' },
    { value: 'neutral', label: '😐', color: '#A0AEC0' },
    { value: 'angry', label: '😠', color: '#FF6B6B' },
    { value: 'anxious', label: '😟', color: '#9F7AEA' },
];

interface MoodLogEntry {
    date: Date;
    mood: string;
    note: string;
}

const initialMoodData: { [key: string]: MoodLogEntry } = {};

export default function Home() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [mood, setMood] = useState('');
    const [note, setNote] = useState('');
    const [moodData, setMoodData] = useState<{ [key: string]: MoodLogEntry }>(initialMoodData);

    const { register, handleSubmit, setValue } = useForm();

    const onSubmit = () => {
        if (!selectedDate || !mood) {
            toast({
                title: "Error",
                description: "Please select a date and mood.",
                variant: "destructive",
            });
            return;
        }

        const dateKey = selectedDate.toISOString().split('T')[0];

        setMoodData(prev => ({
            ...prev,
            [dateKey]: {
                date: selectedDate,
                mood: mood,
                note: note,
            }
        }));

        toast({
            title: "Success",
            description: "Mood saved!",
        });
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            const dateKey = date.toISOString().split('T')[0];
            const existingMood = moodData[dateKey];
            if (existingMood) {
                setMood(existingMood.mood);
                setNote(existingMood.note);
                setValue("mood", existingMood.mood);
                setValue("note", existingMood.note);
            } else {
                setMood('');
                setNote('');
                setValue("mood", '');
                setValue("note", '');
            }
        }
    };

    const weeklyMoodData = Object.values(moodData)
        .filter(entry => {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            return entry.date >= startOfWeek;
        })
        .reduce((acc: { [key: string]: number }, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {});

    const chartData = moodEmojis.map(emoji => ({
        name: emoji.label,
        count: weeklyMoodData[emoji.value] || 0,
    }));

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Mood Log</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-secondary">
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                        <CardDescription>Choose a date to log your mood.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                        />
                        {selectedDate ? (
                            <p>Selected Date: {selectedDate.toLocaleDateString()}</p>
                        ) : (
                            <p>Please select a date.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-secondary">
                    <CardHeader>
                        <CardTitle>Mood Selection</CardTitle>
                        <CardDescription>How are you feeling today?</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            {moodEmojis.map((emoji) => (
                                <Button
                                    key={emoji.value}
                                    variant="outline"
                                    className={`w-full p-4 rounded-full ${mood === emoji.value ? 'bg-accent text-white' : ''}`}
                                    onClick={() => {
                                        setMood(emoji.value);
                                        setValue("mood", emoji.value);
                                    }}
                                >
                                    {emoji.label}
                                </Button>
                            ))}
                        </div>
                        <Textarea
                            placeholder="Add a note about your mood (optional)"
                            className="rounded-md border"
                            value={note}
                            onChange={(e) => {
                                setNote(e.target.value);
                                setValue("note", e.target.value);
                            }}
                        />
                        <Button onClick={handleSubmit(onSubmit)} className="bg-primary text-white">
                            Save Mood
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-8 bg-secondary">
                <CardHeader>
                    <CardTitle>Weekly Mood Statistics</CardTitle>
                    <CardDescription>Your mood distribution for the week.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {moodEmojis.map((emoji) => (
                          <Bar key={emoji.value} dataKey="count" fill={emoji.color} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

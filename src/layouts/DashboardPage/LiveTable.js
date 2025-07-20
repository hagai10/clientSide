import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { parse } from 'date-fns';

function LiveTable() {
    const [matches, setMatches] = useState([]);
    const [timers, setTimers] = useState({});
    const timersRef = useRef({});

    useEffect(() => {
        fetchMatches();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchUpdatedMatches();

            const newTimers = { ...timersRef.current };
            const updatedMatches = matches.filter((match, index) => {
                const timer = newTimers[index];
                if (!timer) return false;
                if (timer.currentTimer < 30 && timer.start) {
                    timer.currentTimer += 1;
                    return true;
                } else if (timer.currentTimer > 30) {
                    timer.start = false;
                    return false;
                } else {
                    const now = new Date();
                    const matchDate = timer.date;
                    if (now >= matchDate) {
                        timer.start = true;
                    }
                    return true;
                }
            });

            timersRef.current = newTimers;
            setTimers({ ...newTimers });
            setMatches(updatedMatches);
        }, 1000);

        return () => clearInterval(interval);
    }, [matches]);


    const fetchMatches = () => {
        axios.post("http://localhost:8080/get-matches-by-type",null,{
                params:{
                    type: "live"
                }
                }
               )
            .then((response) => {
                const matchData = Array.isArray(response.data) ? response.data : [];
                setMatches(matchData);
                const initialTimers = response.data.reduce((acc, match, index) => {
                    let matchDate = new Date();
                    try {
                        matchDate = parse(match.date, 'dd/MM/yy HH:mm:ss', new Date());
                    } catch (e) {
                        console.warn("Invalid match date:", match.date);
                    }
                    acc[index] = { currentTimer:0, start: false, date: matchDate };
                    return acc;
                }, {});
                timersRef.current = initialTimers;
                setTimers(initialTimers);
            })
            .catch((error) => {
                console.error("Error fetching matches:", error);
            });
    };

    const fetchUpdatedMatches = () => {
        axios.post("http://localhost:8080/get-matches-by-type",null,{
                params:{
                    type: "live"
                }
            })
            .then((response) => {
                setMatches(response.data);
            })
            .catch((error) => {
                console.error("Error fetching updated matches:", error);
            });
    };

    return (
        <div className="container">
            <h1 className="my-4 text-center">Live Matches</h1>
            {matches.map((match, index) => (
                <div key={index} className="card my-4" style={{ backgroundColor: '#28a745', color: 'white' }}>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-left">
                                <h4>{match.team1.name}</h4>
                            </div>
                            <div className="text-center">
                                <h2>{match.resultTeam1} - {match.resultTeam2}</h2>
                                {timers[index] && (
                                    <span className="badge badge-pill badge-warning p-2 mt-2" style={{ fontSize: '1.2rem' }}>
                                        <i className="fas fa-clock mr-2"></i>
                                        {match.time< 0 ? ' Awaiting match start' : match.time<30 ? ' '+match.time : ' Game over'}
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <h4>{match.team2.name}</h4>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mt-4">
                            <div>Round: {match.roundNum}</div>
                            <div>Date: {match.date}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default LiveTable;

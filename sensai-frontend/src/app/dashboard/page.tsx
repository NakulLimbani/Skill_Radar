// sensai-frontend/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RadarChart from '../components/dashboard/RadarChart';
import SkillDetailPanel from '../components/dashboard/SkillDetailPanel';

const DashboardPage = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(''); // New state variable

    // Fetch the list of candidates on page load
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`);
                
                // Add error handling for non-ok responses
                if (!res.ok) {
                    throw new Error(`Failed to fetch candidates: ${res.statusText}`);
                }
                
                const data = await res.json();
                setCandidates(data);
            } catch (error) {
                console.error("Failed to fetch candidates:", error);
            }
        };
        fetchCandidates();
    }, []);

    // Function to handle candidate selection
    const handleSelectCandidate = async (candidateId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${candidateId}/skills`);
            
            if (!res.ok) {
                throw new Error(`Failed to fetch candidate skills: ${res.statusText}`);
            }
            
            const data = await res.json();
            setSelectedCandidate(data);
            setSelectedCandidateId(candidateId); // Store the selected candidate's ID
            setSelectedSkill(null); // Clear skill details
        } catch (error) {
            console.error("Failed to fetch candidate skills:", error);
        }
    };
    
    // Function to handle skill selection (for the drill-down panel)
    const handleSelectSkill = async (skillName: string) => {
        // Ensure a candidate is selected before fetching skill details
        console.log(`Fetching details for skill: ${skillName}`);
        if (!selectedCandidateId) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${selectedCandidateId}/skills/${skillName}/details`);
            
            if (!res.ok) {
                throw new Error(`Failed to fetch skill details: ${res.statusText}`);
            }

            const data = await res.json();
            setSelectedSkill(data);
        } catch (error) {
            console.error("Failed to fetch skill details:", error);
        }
    };

    return (
        <main className="container mx-auto p-4 flex">
            {/* Candidate List - left sidebar */}
            <aside className="w-1/4 p-4 border-r">
                <h2 className="text-xl font-bold mb-4">Candidates</h2>
                <ul>
                    {candidates.map((candidate: any) => (
                        <li key={candidate.id} className="mb-2">
                            <button
                                onClick={() => handleSelectCandidate(candidate.id)}
                                className="text-blue-600 hover:underline"
                            >
                                {candidate.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main content area */}
            <section className="w-3/4 p-4">
                {selectedCandidate ? (
                    <div>
                        <h1 className="text-2xl font-bold mb-4">{selectedCandidate.name}'s Skill Radar</h1>
                        
                        {/* Render the RadarChart component */}
                        <RadarChart
                            data={selectedCandidate.scores}
                            onSkillClick={handleSelectSkill}
                        />
                        
                        {/* Drill-down panel component will go here */}
                        {selectedSkill && <SkillDetailPanel data={selectedSkill} />}
                        
                    </div>
                ) : (
                    <p className="text-gray-500">Please select a candidate to view their dashboard.</p>
                )}
            </section>
        </main>
    );
};

export default DashboardPage;
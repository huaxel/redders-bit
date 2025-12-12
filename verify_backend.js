import { client } from './frontend/src/api/client.js';

// Mock client for node environment (since client.js uses fetch)
global.fetch = fetch;

const BASE_URL = 'http://localhost:3001';

async function verify() {
    console.log("🔍 Verifying Backend...");

    // 1. Check Employees
    try {
        const res = await fetch(`${BASE_URL}/api/employees`, { headers: { 'x-user-id': '1' } });
        const data = await res.json();
        console.log(`✅ Employees fetched: ${data.length}`);
    } catch (e) {
        console.error("❌ Employees fetch failed", e);
    }

    // 2. Schedule 8 Consecutive Days
    console.log("🧪 Testing US-07 (8 Consecutive Days)...");
    const userId = 2; // Marie
    const month = '12';
    const year = '2025';
    
    // Clear first? No, let's just try to insert.
    let successCount = 0;
    for(let i=1; i<=8; i++) {
        const date = `${year}-${month}-${String(i).padStart(2,'0')}`;
        const res = await fetch(`${BASE_URL}/api/schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': '1' }, // Admin
            body: JSON.stringify({
                user_id: userId,
                date: date,
                start_time: '09:00',
                end_time: '17:00',
                type: 'redder'
            })
        });
        
        if (res.ok) {
            console.log(`Day ${i}: Scheduled OK`);
            successCount++;
        } else {
            const err = await res.json();
            console.log(`Day ${i}: Blocked -> ${err.error}`);
        }
    }

    if (successCount === 7) {
        console.log("✅ US-07 Passed: 7 days allowed, 8th blocked.");
    } else {
        console.log(`❌ US-07 Failed: Scheduled ${successCount} days.`);
    }
}

verify();

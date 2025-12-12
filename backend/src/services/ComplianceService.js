import { query } from '../db.js';

export class ComplianceService {
  
  static validateScheduleItem(item) {
    const errors = [];
    const warnings = [];
    
    const { user_id, date, start_time, end_time, type } = item;
  
    // 1. Min/Max Hours Check (Working Time)
    const start = new Date(`2000-01-01T${start_time}`);
    const end = new Date(`2000-01-01T${end_time}`);
    const hours = (end - start) / 3600000;
    
    if (hours < 3) errors.push('Minimale shift is 3 uur (Wetgeving)');
    if (hours > 9) errors.push('Maximale dagshift is 9 uur (Wetgeving)');
  
    // 2. Rest Time Check (11h)
    // Check previous day/shift
    const prevShift = query(`
      SELECT * FROM schedule_items 
      WHERE user_id = ? 
      AND (date < ? OR (date = ? AND end_time <= ?))
      ORDER BY date DESC, end_time DESC LIMIT 1
    `, [user_id, date, date, start_time])[0];
  
    if (prevShift) {
      const prevEnd = new Date(`${prevShift.date}T${prevShift.end_time}`);
      const currStart = new Date(`${date}T${start_time}`);
      const restHours = (currStart - prevEnd) / 3600000; // milliseconds to hours
      
      // Only check if it's within 24h
      if (restHours > 0 && restHours < 11) {
         errors.push(`Onvoldoende rusttijd: ${restHours.toFixed(1)}u (Min 11u vereist)`);
      }
    }

    // 2b. Consecutive Days Check (US-07) - Max 7 days
    try {
        // Check backwards
        let consecutiveBefore = 0;
        for(let i=1; i<=7; i++) {
            const checkDate = new Date(date);
            checkDate.setDate(checkDate.getDate() - i);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const hasShift = query("SELECT 1 FROM schedule_items WHERE user_id = ? AND date = ?", [user_id, checkDateStr]).length > 0;
            if(hasShift) consecutiveBefore++;
            else break;
        }

        // Check forwards
        let consecutiveAfter = 0;
        for(let i=1; i<=7; i++) {
            const checkDate = new Date(date);
            checkDate.setDate(checkDate.getDate() + i);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const hasShift = query("SELECT 1 FROM schedule_items WHERE user_id = ? AND date = ?", [user_id, checkDateStr]).length > 0;
            if(hasShift) consecutiveAfter++;
            else break;
        }

        if (consecutiveBefore + 1 + consecutiveAfter > 7) {
            errors.push(`Te veel opeenvolgende werkdagen (${consecutiveBefore + 1 + consecutiveAfter}). Maximaal 7 toegestaan.`);
        }
    } catch(e) {
        console.error("Error in consecutive check", e);
    }
  
    // 3. Rental Period Check (US-06)
    if (type === 'redder') {
      const overlappingRental = query(`
          SELECT * FROM rental_periods 
          WHERE start_date <= ? AND end_date >= ?
      `, [date, date])[0];
  
      if (overlappingRental) {
          errors.push(`Zwembad verhuurd aan ${overlappingRental.renter_name} - geen redders nodig`);
      }
    }
  
    // 4. Diploma Check (US-05) - Warning only
    if (type === 'lesgever') {
      const instructor = query('SELECT * FROM instructors WHERE user_id = ?', [user_id])[0];
      if (instructor && instructor.has_initiator_diploma === 0) {
          warnings.push('Lesgever heeft geen initiatordiploma');
      }
      if (!instructor) {
          warnings.push('Kan diploma niet verifiëren (niet gevonden in lesgevers tabel)');
      }
    }
  
    return { valid: errors.length === 0, errors, warnings };
  }

  static getVlaremCompliance(poolId, year, month) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;

      const pool = query('SELECT * FROM pools WHERE id = ?', [poolId])[0];
      if (!pool) throw new Error('Pool not found');

      // 1 lifeguard per started 250m2
      const requiredLifeguards = Math.ceil(pool.surface_area / 250);

      // Get all shifts grouped by date
      const shifts = query(`
        SELECT date, start_time, end_time 
        FROM schedule_items 
        WHERE pool_id = ? AND type = 'redder' AND date BETWEEN ? AND ?
      `, [poolId, startDate, endDate]);

      const report = {};
      const byDate = {};
      shifts.forEach(s => {
        if (!byDate[s.date]) byDate[s.date] = [];
        byDate[s.date].push(s);
      });

      for (let d = 1; d <= 31; d++) {
        const dateStr = `${year}-${month.padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayShifts = byDate[dateStr] || [];
        const maxConcurrency = dayShifts.length; // Simplified
        
        report[dateStr] = {
          required: requiredLifeguards,
          actual_max: maxConcurrency,
          status: maxConcurrency >= requiredLifeguards ? 'ok' : 'deficiency'
        };
      }
      return report;
  }

  static getTimeRegistrationReport(year, month) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
  
      const employees = query('SELECT * FROM users');
      const report = {};
  
      employees.forEach(u => {
          const shifts = query(`
              SELECT * FROM schedule_items 
              WHERE user_id = ? AND date BETWEEN ? AND ?
              ORDER BY date
          `, [u.id, startDate, endDate]);
  
          let totalHours = 0;
          let daysWorked = new Set();
          let violations = [];
  
          shifts.forEach(s => {
              const start = new Date(`2000-01-01T${s.start_time}`);
              const end = new Date(`2000-01-01T${s.end_time}`);
              totalHours += (end - start) / 3600000;
              daysWorked.add(s.date);
          });
  
          if(u.role === 'redder') {
               const lg = query('SELECT max_hours_month FROM lifeguards WHERE user_id = ?', [u.id])[0];
               if(lg && totalHours > lg.max_hours_month) {
                   violations.push(`Overschrijding maandlimiet (${Math.round(totalHours)}/${lg.max_hours_month}u)`);
               }
          }
  
          report[u.name] = {
              role: u.role,
              shifts: shifts.length,
              total_hours: Math.round(totalHours * 10) / 10,
              days_count: daysWorked.size,
              violations
          };
      });
      return report;
  }
}

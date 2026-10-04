/**
 * REST API Client for Family Health Tracker
 *
 * Simulated REST API layer with JWT authentication for:
 * - Authentication (login, registerManager, joinFamily, JWT session)
 * - Family & Members (getFamily, getMembers, addMember, updateMember, deleteMember, etc.)
 * - Health Readings (getReadings, addReading, updateReading, deleteReading)
 * - Medicines & Schedule (getMedicines, addMedicine, toggleMedicineTaken, deleteMedicine)
 * - Doctor Appointments (getAppointments, addAppointment, deleteAppointment)
 * - Family Alerts (getAlerts, dismissAlert)
 * - Indian Food Database (searchFood)
 * - AI Weekly Health Summary (getWeeklySummary, getAiSummary)
 *
 * Connect to a real Node + Express + MongoDB backend by replacing these
 * functions with fetch(`${API_BASE}/...`, { headers: { Authorization: `Bearer ${token}` } })
 */

export * from '../services/apiClient';
import * as svc from '../services/apiClient';

export const getAiSummary = svc.getWeeklySummary;
export const searchFood = svc.searchFoods;
